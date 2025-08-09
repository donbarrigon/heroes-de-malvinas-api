import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'


export default class extends BaseSeeder {
    async run() {

        if (process.env.NODE_ENV === 'development') {
            await Role.truncate(true)
            await Permission.truncate(true)
        }

        const roleUser = await Role.create({ name: 'usuario' })
        const roleAdmin = await Role.create({ name: 'admin' })
        const roleModerator = await Role.create({ name: 'moderador' })

        const namePermissions = {
            permissions: ['user', 'country', 'state', 'city', 'role', 'permission'],
            moderator: ['view chat', 'mute chat'],
            user : ['view only'],
        }

        const mixPermissions = (permissions: string[], prefixes: string[]): { name: string }[] => {
            const p: { name: string }[] = []
            for (const permission of permissions) {
                for (const prefix of prefixes) {
                    p.push({ name: prefix + ' ' + permission })
                }
            }
            return p
        }
        const allPermissions = mixPermissions(namePermissions.permissions, ['view', 'create', 'update', 'delete'])
        allPermissions.push({ name: 'grant role'})
        allPermissions.push({ name: 'grant permission'})
        allPermissions.push({ name: 'view only'})

        const permissionModels = await Permission.createMany(allPermissions)
        await roleAdmin.related('permissions').attach(
            permissionModels.map((p) => p.id)
        )

        const listModeratorPermissions = await Permission.query().whereIn('name', namePermissions.moderator)
        await roleModerator.related('permissions').attach(
            listModeratorPermissions.map((p) => p.id)
        )

        const listUserPermissions = await Permission.query().whereIn('name', namePermissions.user)
        await roleUser.related('permissions').attach(
            listUserPermissions.map((p) => p.id)
        )
    }
}
