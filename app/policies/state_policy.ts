import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class StatePolicy extends BasePolicy {
    async view(user: User): Promise<AuthorizerResponse> {
        return await user.can('view state')
    }

    async create(user: User): Promise<AuthorizerResponse> {
        return await user.can('create state')
    }

    async update(user: User): Promise<AuthorizerResponse> {
        return await user.can('update state')
    }

    async delete(user: User): Promise<AuthorizerResponse> {
        return await user.can('delete state')
    }
}
