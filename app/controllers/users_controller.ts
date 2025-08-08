
import Activity from '#models/activity'
import Profile from '#models/profile'
import Role from '#models/role'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import MailService from '#services/mail_service'
import ResponseErrorService from '#services/response_error_service'
import { createUserValidator, updateUserEmailValidator, updateUserPasswordValidator, updateUserProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Database from '@adonisjs/lucid/services/db'
import { randomBytes } from 'crypto'
import { DateTime } from 'luxon'

export default class UsersController {

    async store({ request, response }: HttpContext) {
        const payload = await request.validateUsing(createUserValidator)

        // Usar transacción para operaciones atómicas
        const trx = await Database.transaction()

        try {
            const user = await User.create({
                email: payload.email,
                password: payload.password, // Se hashea automáticamente
            }, { client: trx })

            // Crear perfil relacionado
            const profile = await user.related('profile').create({
                nickname: payload.nickname,
                fullName: payload.full_name,
                phoneNumber: payload.phone_number,
                discordUsername: payload.discord_username,
                cityId: payload.city_id,
                preferences: payload.preferences || null
            }, { client: trx })

            await trx.commit()

            let roleId = 1
            const role = await Role.findBy('name', 'user')
            if (role === null) {
                logger.error({ message: 'Rol user no encontrado', data: user})
            }else{
                roleId = role.id
            }
            await user.related('roles').attach([roleId])
            const token = await User.accessTokens.create(user)
            await user.load((loader) => {
                loader.load('profile').load('permissions').load('roles', (roleQuery) => {
                    roleQuery.preload('permissions')
                })
            })

            MailService.sendConfirmationEmail(user)
            Activity.record(user, profile, Activity.CREATE)

            return response.ok({
                user: user,
                token: token
            })
        } catch (error) {
        // Rollback en caso de error
            await trx.rollback()

            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async updateProfile({ auth, request, response, bouncer }: HttpContext) {
        const id = request.param('id', 0)
        const payload = await request.validateUsing(updateUserProfileValidator)

        const user = await User.query().where('id', id).first()
        if (user === null) {
            return ResponseErrorService.notFound(response, id)
        }

        if(await bouncer.with(UserPolicy).denies('update', user)) {
            return ResponseErrorService.forbidden(response)
        }

        const profile = await user.related('profile').query().firstOrFail()
        if (profile === null) {
            logger.error({ message: 'Perfil no encontrado', errorSourceData: user})
            return ResponseErrorService.notFound(response, id)
        }

        try {
            const changes = profile.merge(payload).$dirty
            await profile.save()
            Activity.record(auth.user!, profile, Activity.UPDATE, changes)
            return response.ok(profile)
        }catch(error) {
            return ResponseErrorService.internalServerError(response, error, profile)
        }
    }

    async updateEmail({ request, response, bouncer, auth }: HttpContext) {
        const id = request.param('id', 0)
        const payload = await request.validateUsing(updateUserEmailValidator)

        const user = await User.query().where('id', id).first()
        if (user === null) {
            return ResponseErrorService.notFound(response, id)
        }

        if (await bouncer.with(UserPolicy).denies('updateEmail')) {
            return ResponseErrorService.forbidden(response)
        }

        try {
            // user.email = payload.email
            // user.emailVerifiedAt = null
            const changes = user.merge({ email: payload.email, emailVerifiedAt: null }).$dirty
            await user.save()
            Activity.record(auth.user!, user, 'mail updated', changes)

            MailService.sendConfirmationEmail(user)

            // invalidar todos los tokens
            const tokens = await User.accessTokens.all(user)
            for (const token of tokens) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.noContent()
        }catch(error) {
            return ResponseErrorService.internalServerError(response, error, user)
        }
    }

    async updatePassword({ auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const payload = await request.validateUsing(updateUserPasswordValidator)

            // user.password = payload
            const changes = user.merge({ password: payload.password }).$dirty
            await user.save()
            Activity.record(user, user, 'password updated', changes)

            MailService.sendUpdatePasswordEmail(user)

            // invalidar todos los tokens
            const tokens = await User.accessTokens.all(user)
            for (const token of tokens) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.noContent()
        }catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async resetPassword({ request, response, bouncer, auth }: HttpContext) {
        if (await bouncer.with(UserPolicy).denies('resetPassword')) {
            return ResponseErrorService.forbidden(response)
        }
        const { email } = request.only(['email'])
        const user = await User.query().where('email', email).first()
        if (user === null) {
            return ResponseErrorService.notFound(response, email)
        }

        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let newPassword = ''
        const bytes = randomBytes(10)
        for (let i = 0; i < 10; i++) {
            newPassword += chars[bytes[i] % chars.length]
        }

        try {
            // user.password = newPassword
            const changes = user.merge({ password: newPassword }).$dirty
            await user.save()
            Activity.record(auth.user!, user, 'password reset', changes)

            MailService.sendResetPasswordEmail(user, newPassword)

            // invalidar todos los tokens
            const tokens = await User.accessTokens.all(user)
            for (const token of tokens) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.noContent()
        }catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response, bouncer, auth }: HttpContext) {
        try {
            const id = request.param('id', 0)
            const user = await User.query().where('id', id).first()
            if (user === null) {
                return ResponseErrorService.notFound(response, id)
            }

            if (await bouncer.with(UserPolicy).denies('delete', user)) {
                return ResponseErrorService.forbidden(response)
            }

            // user.deletedAt = DateTime.now()
            const changes = user.merge({ deletedAt: DateTime.now() }).$dirty
            await user.save()
            Activity.record(auth.user!, user, Activity.DELETE, changes)

            return response.noContent()
        }
        catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth }: HttpContext) {
        try {
            const id = request.param('id', 0)
            const user = await User.query().where('id', id).first()
            if (user === null) {
                return ResponseErrorService.notFound(response, id)
            }
            if (await bouncer.with(UserPolicy).denies('delete', user)) {
                return ResponseErrorService.forbidden(response)
            }
            const changes = user.merge({ deletedAt: null }).$dirty
            await user.save()
            Activity.record(auth.user!, user, Activity.RESTORE, changes)

            return response.ok(user)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async login({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        const user = await User.verifyCredentials(email, password)

        if (user.deletedAt !== null) {
            return response.forbidden({
                message: 'Cuenta desactivada. Comuníquese con el administrador.',
                errors: 'Su cuenta ha sido desactivada.'
            })
        }

        const token = await User.accessTokens.create(user)
        Activity.record(user, user, Activity.LOGIN, {})

        await user.load((loader) => {
            loader.load('profile').load('permissions').load('roles', (roleQuery) => {
                roleQuery.preload('permissions')
            })
        })

        return response.ok({
            user: user,
            token: token
        })
    }

    async logout({ auth, response }: HttpContext) {
        try {
            await auth.use('api').invalidateToken()
            Activity.record(auth.user!, auth.user!, Activity.LOGOUT, {})
            return response.noContent()
        }catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }
}
