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

const CitiesController = () => import('#controllers/cities_controller')
const StatesController = () => import('#controllers/states_controller')
const CountriesController = () => import('#controllers/countries_controller')
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

        router.group(() => {
            router.get('countries', [CountriesController, 'index'])
            router.get('countries/trashed', [CountriesController, 'trashed'])
            router.get('countries/:id', [CountriesController, 'show'])
            router.post('countries', [CountriesController, 'store'])
            router.put('countries/:id', [CountriesController, 'update'])
            router.delete('countries/:id', [CountriesController, 'destroy'])
            router.patch('countries/:id/restore', [CountriesController, 'restore'])
            router.delete('countries/:id/force-delete', [CountriesController, 'forceDelete'])

            router.get('states', [StatesController, 'index'])
            router.get('states/trashed', [StatesController, 'trashed'])
            router.get('states/:id', [StatesController, 'show'])
            router.post('states', [StatesController, 'store'])
            router.put('states/:id', [StatesController, 'update'])
            router.delete('states/:id', [StatesController, 'destroy'])
            router.patch('states/:id/restore', [StatesController, 'restore'])
            router.delete('states/:id/force-delete', [StatesController, 'forceDelete'])

            router.get('cities', [CitiesController, 'index'])
            router.get('cities/trashed', [CitiesController, 'trashed'])
            router.get('cities/:id', [CitiesController, 'show'])
            router.post('cities', [CitiesController, 'store'])
            router.put('cities/:id', [CitiesController, 'update'])
            router.delete('cities/:id', [CitiesController, 'destroy'])
            router.patch('cities/:id/restore', [CitiesController, 'restore'])
            router.delete('cities/:id/force-delete', [CitiesController, 'forceDelete'])
        }).prefix('dashboard')

        // router.get('users', [UsersController, 'index'])
        // router.get('users/trashed', [UsersController, 'trashed'])
        // router.get('users/:id', [UsersController, 'show'])
        router.put('users/:id', [UsersController, 'updateProfile'])
        router.patch('users/:id/email', [UsersController, 'updateEmail'])
        router.patch('users/:id/password', [UsersController, 'updatePassword'])
        router.patch('users/:id/reset-password', [UsersController, 'resetPassword'])
        router.delete('users/:id', [UsersController, 'destroy'])
        router.patch('users/:id/restore', [UsersController, 'restore'])
        router.post('users/logout', [UsersController, 'logout'])
    }).use(middleware.auth())

}).prefix('api')
