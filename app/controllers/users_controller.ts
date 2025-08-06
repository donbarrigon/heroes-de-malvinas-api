
import User from '#models/user'
import { createUserValidator, updateUserEmailValidator, updateUserPasswordValidator, updateUserProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/lucid'
import Database from '@adonisjs/lucid/services/db'

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

      const accessToken = await User.accessTokens.create(user)

      user.sendVerificationEmail()

      return response.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          profile: {
            id: profile.id,
            nickname: profile.nickname,
            full_name: profile.fullName,
            phone_number: profile.phoneNumber,
            discord_username: profile.discordUsername,
            city_id: profile.cityId,
            preferences: profile.preferences,
          }
        },
        token: {
          type: 'bearer',
          value: accessToken.value!.release()
        }
      })

    } catch (error) {
      // Rollback en caso de error
      await trx.rollback()

      return response.status(500).json({
        message: 'Error al registrar usuario',
        errors: error.messages || error.message || String(error)
      })
    }
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    try {
      const authUser = await auth.use('api').authenticate()
      const payload = await request.validateUsing(updateUserProfileValidator)
      const profile = await authUser.related('profile').query().firstOrFail()

      profile.merge(payload)
      await profile.save()

      return response.status(200).json(profile)
    }catch (error) {
      if (error instanceof errors.E_ROW_NOT_FOUND) {
        return response.status(404).json({
          message: 'Perfil no encontrado',
          errors: error.message
        })
      }

      return response.status(500).json({
        message: 'No se actualizó el perfil',
        errors: error.messages || error.message || String(error)
      })
    }
  }

  async updateEmail({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const payload = await request.validateUsing(updateUserEmailValidator)

      user.email = payload.email
      user.emailVerifiedAt = null
      await user.save()

      user.sendVerificationEmail()

      return response.status(204)
    }catch (error) {
      return response.status(500).json({
        message: 'No se actualizó el correo',
        errors: error.messages || error.message || String(error)
      })
    }
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const payload = await request.validateUsing(updateUserPasswordValidator)

      user.password = payload.password
      await user.save()

      return response.status(204)
    }catch (error) {
      return response.status(500).json({
        message: 'No se actualizó la contraseña',
        errors: error.messages || error.message || String(error)
      })
    }
  }
}
