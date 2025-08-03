import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.string('name').notNullable()

      table.integer('state_id').unsigned().references('id').inTable('states').onDelete('CASCADE')
      table.string('state_code')
      table.string('state_name')

      table.integer('country_id').unsigned().references('id').inTable('countries').onDelete('CASCADE')
      table.string('country_code')
      table.string('country_name')

      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.string('wiki_data_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable().index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
