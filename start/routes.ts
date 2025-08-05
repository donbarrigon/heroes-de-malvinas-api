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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.group(() => {
  // Rutas públicas (sin auth)
  router.post('users', 'UsersController.store')
  router.post('users/login', 'UsersController.login')
  router.post('users/logout', 'UsersController.logout')

  // Rutas protegidas (con auth)
  router.group(() => {
    router.put('users/:id', 'UsersController.update')
    router.delete('users/:id', 'UsersController.destroy')
    router.patch('users/:id/restore', 'UsersController.restore')
  }).use(middleware.auth())

}).prefix('/api')
