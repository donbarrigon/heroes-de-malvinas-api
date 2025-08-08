/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return {
    hello: 'home de heroes de malvinas',
  }
})
router.group(() => {
    // Rutas públicas (sin auth)
    router.post('users', [UsersController, 'store']) // registarse
    router.post('users/login', [UsersController, 'login'])


    // Rutas protegidas (con auth)
    router.group(() => {
        router.put('users/:id', [UsersController, 'updateProfile'])
        router.patch('users/:id/email', [UsersController, 'updateEmail'])
        router.patch('users/:id/password', [UsersController, 'updatePassword'])
        router.patch('users/:id/reset-password', [UsersController, 'resetPassword'])
        router.delete('users/:id', [UsersController, 'destroy'])
        router.patch('users/:id/restore', [UsersController, 'restore'])
        router.post('users/logout', [UsersController, 'logout'])
    }).use(middleware.auth())

}).prefix('/api')
