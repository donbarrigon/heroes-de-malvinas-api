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
  declare stateCode: string | null

  @column()
  declare stateName: string | null

  @column()
  declare countryId: number

  @column()
  declare countryCode: string | null

  @column()
  declare countryName: string | null

  @column()
  declare latitude?: number | null

  @column()
  declare longitude?: number | null

  @column()
  declare wikiDataId?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null

  @belongsTo(() => State)
  declare state: BelongsTo<typeof State>

  @belongsTo(() => Country)
  declare country: BelongsTo<typeof Country>
}
