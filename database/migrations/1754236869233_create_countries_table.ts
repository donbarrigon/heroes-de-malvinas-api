import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'countries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('iso3').notNullable().unique()
      table.string('iso2').notNullable().unique()
      table.string('numeric_code').nullable()
      table.string('phonecode').nullable()
      table.string('capital').nullable()

      table.string('currency').nullable()
      table.string('currency_name').nullable()
      table.string('currency_symbol').nullable()

      table.string('tld').nullable()
      table.string('native').nullable()
      table.string('region').nullable()
      table.integer('region_id').nullable()
      table.string('subregion').nullable()
      table.integer('subregion_id').nullable()

      table.string('nationality').nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()

      table.string('emoji').nullable()
      table.string('emojiU').nullable()

      table.jsonb('timezones').nullable()
      table.jsonb('translations').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable().index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
