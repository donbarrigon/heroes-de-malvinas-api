
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Permission from './permission.js'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Permission)
  declare permissions: ManyToMany<typeof Permission>
}
