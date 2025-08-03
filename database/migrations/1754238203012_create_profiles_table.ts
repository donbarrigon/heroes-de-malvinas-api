import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('avatar').nullable()
      table.string('nickname').unique()
      table.string('full_name').nullable()
      table.string('phone_number').nullable()
      table.string('discord_username').nullable()
      table.integer('city_id').notNullable().unsigned().references('id').inTable('cities').onDelete('CASCADE')
      table.jsonb('preferences').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable().index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
