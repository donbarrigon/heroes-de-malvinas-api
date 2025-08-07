
import Activity from '#models/activity'
import Role from '#models/role'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ResponseErrorService from '#services/response_error_service'
import { createUserValidator, updateUserEmailValidator, updateUserPasswordValidator, updateUserProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Database from '@adonisjs/lucid/services/db'
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

            user.sendVerificationEmail()
            Activity.record(user, user, Activity.CREATE)

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

    async updateProfile({ auth, request, response }: HttpContext) {
        try {
            const authUser = await auth.use('api').authenticate()
            const payload = await request.validateUsing(updateUserProfileValidator)
            const profile = await authUser.related('profile').query().first()
            if (profile === null) {
                logger.error({ message: 'Perfil no encontrado', data: authUser})
                return ResponseErrorService.notFound(response, authUser.id)
            }

            profile.merge(payload)
            await profile.save()
            Activity.record(authUser, profile, Activity.UPDATE)

            return response.ok(profile)
        }catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async updateEmail({ request, response, bouncer, auth }: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }
            const payload = await request.validateUsing(updateUserEmailValidator)
            const user = await User.query().where('id', id).first()
            if (user === null) {
                return ResponseErrorService.notFound(response, id)
            }
            if (await bouncer.with(UserPolicy).denies('updateEmail')) {
                return ResponseErrorService.forbidden(response)
            }
            user.email = payload.email
            user.emailVerifiedAt = null
            await user.save()
            Activity.record(auth.user!, user, 'mail updated')

            user.sendVerificationEmail()

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

    async updatePassword({ auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const payload = await request.validateUsing(updateUserPasswordValidator)

            user.password = payload.password
            await user.save()
            Activity.record(user, user, 'password updated')

            user.sendUpdatePasswordEmail()

            // invalidar todos los tokens
            const tokens = await User.accessTokens.all(user)
            for (const token of tokens) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.status(204)
        }catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response, bouncer, auth }: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const user = await User.query().where('id', id).first()
            if (user === null) {
                return ResponseErrorService.notFound(response, id)
            }

            if (await bouncer.with(UserPolicy).denies('delete', user)) {
                return ResponseErrorService.forbidden(response)
            }

            user.deletedAt = DateTime.now()
            await user.save()
            Activity.record(auth.user!, user, Activity.DELETE)

            return response.noContent()
        }
        catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth }: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }
            const user = await User.query().where('id', id).first()
            if (user === null) {
                return ResponseErrorService.notFound(response, id)
            }
            if (await bouncer.with(UserPolicy).denies('delete', user)) {
                return ResponseErrorService.forbidden(response)
            }
            user.deletedAt = null
            await user.save()
            Activity.record(auth.user!, user, Activity.RESTORE)

            return response.ok(user)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    public async login({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        const user = await User.verifyCredentials(email, password)
        const token = await User.accessTokens.create(user)
        Activity.record(user, user, Activity.LOGIN)

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
}
