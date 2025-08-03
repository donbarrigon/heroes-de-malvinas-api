import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('model').notNullable()
      table.integer('model_id').notNullable()
      table.string('action').notNullable()
      table.jsonb('changes').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.index(['model', 'model_id'], 'model_index')
      table.index(['created_at'], 'created_at_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
