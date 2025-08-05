import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Profile from './profile.js'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Permission from './permission.js'
import db from '@adonisjs/lucid/services/db'
import UserToken from './user_token.js'
import MailService from '#services/mail_service'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare emailVerifiedAt?: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @manyToMany(() => Role)
  declare roles: ManyToMany<typeof Role>

  @manyToMany(() => Permission)
  declare permissions: ManyToMany<typeof Permission>

  @hasMany(() => UserToken)
  declare tokens: HasMany<typeof UserToken>

  // funcion para verificar permisos
  async can(permission: string): Promise<boolean> {
    const result = await db
      .from('permissions')
      .select('permissions.id')
      .where('permissions.name', permission)
      .whereExists((subquery) => {
        subquery
          .from('permission_user')
          .whereColumn('permission_user.permission_id', 'permissions.id')
          .where('permission_user.user_id', this.id)
      })
      .orWhereExists((subquery) => {
        subquery
          .from('permission_role')
          .join('role_user', 'role_user.role_id', 'permission_role.role_id')
          .whereColumn('permission_role.permission_id', 'permissions.id')
          .where('role_user.user_id', this.id)
      })
      .first()
    return !!result
  }

  // funcion para verificar si el usuario tiene un rol
  async hasRole(role: string): Promise<boolean> {
    const result = await db
      .from('roles')
      .select('roles.id')
      .where('roles.name', role)
      .whereExists((subquery) => {
        subquery
          .from('role_user')
          .whereColumn('role_user.role_id', 'roles.id')
          .where('role_user.user_id', this.id)
      })
      .first()
    return !!result
  }

  // funcion para crear un token de proposito general no son para acceso o para autenticación
  async createToken(purpose: string): Promise<UserToken> {
    return UserToken.create({
      userId: this.id,
      purpose: purpose,
      token: crypto.randomUUID(),
      isUsed: false,
      expiresAt: DateTime.now().plus({ hours: 1 }),
    })
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      const token = await this.createToken('verification')
      MailService.sendConfirmationEmail(this.email, token.token)
    } catch (error) {
      console.error('Error al enviar el correo de verificación:', error)
    }
  }
}
