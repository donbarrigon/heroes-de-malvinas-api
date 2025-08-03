
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Role from './role.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Role)
  declare roles: ManyToMany<typeof Role>
}
