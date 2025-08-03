import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import City from './city.js'

export default class Profile extends BaseModel {
    @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare avatar?: string | null

  @column()
  declare nickname: string

  @column()
  declare fullName?: string | null

  @column()
  declare phoneNumber?: string | null

  @column()
  declare discordUsername?: string | null

  @column()
  declare cityId: number

  @column()
  declare preferences?: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => City)
  declare city: BelongsTo<typeof City>
}
