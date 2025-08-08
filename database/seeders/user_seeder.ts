import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
    async run() {
        const user = await Role.create({ name: 'user' })
        const admin = await Role.create({ name: 'admin' })

        const onlyView = await Permission.create({ name: 'only view' })
        const viewUser = await Permission.create({ name: 'view user' })
        const updateUser = await Permission.create({ name: 'update user' })
        const deleteUser = await Permission.create({ name: 'delete user' })

        await user.related('permissions').attach([onlyView.id])

        await admin.related('permissions').attach([
        viewUser.id,
        updateUser.id,
        deleteUser.id
        ])
    }
}
