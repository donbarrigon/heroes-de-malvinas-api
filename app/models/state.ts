import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import City from './city.js'
import Country from './country.js'

export default class State extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare countryId: number

  @column()
  declare countryCode: string | null

  @column()
  declare countryName: string | null

  @column()
  declare iso2: string | null

  @column()
  declare fipsCode?: string | null

  @column()
  declare type?: string | null

  @column()
  public level?: string | null

  @column()
  declare parentId?: number | null

  @column()
  declare latitude?: number | null

  @column()
  declare longitude?: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null

  @hasMany(() => City)
  declare cities: HasMany<typeof City>

  @belongsTo(() => Country)
  declare country: BelongsTo<typeof Country>
}
