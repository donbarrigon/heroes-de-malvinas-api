import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import State from './state.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Country from './country.js'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare stateId: number

  @column()
  declare stateCode: string

  @column()
  declare stateName: string

  @column()
  declare countryId: number

  @column()
  declare countryCode: string

  @column()
  declare countryName: string

  @column()
  declare latitude?: number

  @column()
  declare longitude?: number

  @column()
  declare wikiDataId?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime

  @belongsTo(() => State)
  declare state: BelongsTo<typeof State>

  @belongsTo(() => Country)
  declare country: BelongsTo<typeof Country>
}
