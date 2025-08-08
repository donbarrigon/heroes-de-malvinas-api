import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
    async view(user: User): Promise<AuthorizerResponse> {
        return user.can('view user')
    }

    async update(authUser: User, user: User): Promise<AuthorizerResponse> {
        return authUser.id === user.id || authUser.can('update user')
    }

    async updateEmail(user: User): Promise<AuthorizerResponse> {
        return user.id === user.id || user.can('update user')
    }

    async resetPassword(user: User): Promise<AuthorizerResponse> {
        return user.can('update user')
    }

    async delete(authUser: User, user: User): Promise<AuthorizerResponse> {
        return authUser.id === user.id || user.can('delete user')
    }
}
