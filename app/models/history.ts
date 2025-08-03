import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class History extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare model: string

  @column()
  declare modelId: number

  @column()
  declare action: string

  @column()
  declare changes?: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
