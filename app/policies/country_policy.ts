import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CountryPolicy extends BasePolicy {

    async view(user: User): Promise<AuthorizerResponse> {
        return await user.can('view country')
    }

    async create(user: User): Promise<AuthorizerResponse> {
        return await user.can('create country')
    }

    async update(user: User): Promise<AuthorizerResponse> {
        return await user.can('update country')
    }

    async delete(user: User): Promise<AuthorizerResponse> {
        return await user.can('delete country')
    }
}
