import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CityPolicy extends BasePolicy {
    async view(user: User): Promise<AuthorizerResponse> {
        return await user.can('view city')
    }

    async create(user: User): Promise<AuthorizerResponse> {
        return await user.can('create city')
    }

    async update(user: User): Promise<AuthorizerResponse> {
        return await user.can('update city')
    }

    async delete(user: User): Promise<AuthorizerResponse> {
        return await user.can('delete city')
    }
}
