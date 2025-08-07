import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'states'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.string('name').notNullable()

      table.integer('country_id').unsigned().notNullable().references('id').inTable('countries').onDelete('CASCADE')
      table.string('country_code').nullable()
      table.string('country_name').nullable()

      table.string('iso_2')
      table.string('fips_code').nullable()
      table.string('type').nullable()
      table.string('level').nullable()
      table.integer('parent_id').nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable().index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
