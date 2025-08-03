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
  declare countryCode: string

  @column()
  declare countryName: string

  @column()
  declare iso2: string

  @column()
  declare fipsCode?: string

  @column()
  declare type?: string

  @column()
  public level?: string

  @column()
  declare parentId?: number

  @column()
  declare latitude?: number

  @column()
  declare longitude?: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime

  @hasMany(() => City)
  declare cities: HasMany<typeof City>

  @belongsTo(() => Country)
  declare country: BelongsTo<typeof Country>
}
