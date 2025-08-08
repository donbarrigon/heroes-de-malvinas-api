import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import logger from '@adonisjs/core/services/logger'

export default class Activity extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number

    @column()
    declare model: string

    @column()
    declare modelId: number

    @column()
    declare action: string

    @column()
    declare changes?: Record<string, any> | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // constantes para mantener la coherencia en las acciones mas comunes
    static readonly CREATE = 'created'
    static readonly UPDATE = 'updated'
    static readonly DELETE = 'deleted'
    static readonly FORCE_DELETE = 'force_deleted'
    static readonly RESTORE = 'restored'
    static readonly LOGIN = 'login'
    static readonly LOGOUT = 'logout'

    // funcion para guardar el historial
    static async record(user: User, model: InstanceType<typeof BaseModel>, action: string, changes?: Record<string, any>): Promise<void> {
        try{
            //const changes = Object.keys(model.$dirty).length > 0 ? model.$dirty : model
            await this.create({
                userId: user.id,
                model: model.constructor.name,
                modelId: Number(model.$primaryKeyValue),
                action: action,
                changes: changes ?? model,
            })
        } catch (error) {
            logger.error({ message: "error al guardar el record del historial", error: error})
        }
    }
}
