import { DateTime } from 'luxon'
import { BaseModel, hasMany , column } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import State from './state.js'
import City from './city.js'

export default class Country extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare iso3: string

  @column()
  declare iso2: string

  @column()
  declare numericCode: string | null

  @column()
  declare phonecode: string | null

  @column()
  declare capital: string | null

  @column()
  declare currency: string | null

  @column()
  declare currencyName: string | null

  @column()
  declare currencySymbol: string | null

  @column()
  declare tld: string | null

  @column()
  declare native: string | null

  @column()
  declare region: string | null

  @column()
  declare regionId: number | null

  @column()
  declare subregion: string | null

  @column()
  declare subregionId: number | null

  @column()
  declare nationality: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare emoji: string | null

  @column()
  declare emojiU: string | null

  @column()
  declare timezones: Record<string, any> | null

  @column()
  declare translations: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @hasMany(() => State)
  declare states: HasMany<typeof State>

  @hasMany(() => City)
  declare cities: HasMany<typeof City>
}
