import type { HttpContext } from '@adonisjs/core/http'
import Country from "#models/country";
import { createCountryValidator } from '#validators/country';
import { DateTime } from 'luxon';

export default class CountriesController {

    async index({request, response}: HttpContext) {
        try {
        const page = request.param('page', 1)
        const limit = request.input('per_page', 10)
        const countries = await Country.query().whereNull('deleted_at').paginate(page, limit)
        return response.ok(countries)
        } catch(error) {
            return response.internalServerError({
                message: 'Error interno del servidor al realizar la busqueda',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async trashed({request, response}: HttpContext) {
        try {
            const page = request.param('page', 1)
            const limit = request.input('per_page', 10)
            const countries = await Country.query().whereNotNull('deleted_at').paginate(page, limit)
            return response.ok(countries)
        } catch(error) {
            return response.internalServerError({
                message: 'Error interno del servidor al realizar la busqueda',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async show({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) { return response.status(404).json({message: 'No existe', errors: 'parametro no encontrado'})}

            const country = await Country.query().where('id', id).whereNull('deleted_at')
                .preload('states', (stateQuery) => {
                    stateQuery.preload('cities') // carga las cities de cada state
                }).firstOrFail()

            return response.ok(country)
        } catch (error) {
            return response.internalServerError({
                message: 'No se pudo obtener el pais',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async store({request, response}: HttpContext) {
        try {
            const payload = await request.validateUsing(createCountryValidator)
            const country = await Country.create(payload)
            return response.created(country)
        } catch (error) {
            return response.internalServerError({
                message: 'Error interno del servidor al crear el pais',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async update({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) { return response.status(404).json({message: 'No existe', errors: 'parametro no encontrado'})}

            const payload = await request.validateUsing(createCountryValidator)
            const country = await Country.query().where('id', id).whereNull('deleted_at').firstOrFail()
            country.merge(payload)
            await country.save()

            return response.ok(country)
        } catch (error) {
            return response.internalServerError({
                message: 'Error interno del servidor al actualizar el pais',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async destroy({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) { return response.status(404).json({message: 'No existe', errors: 'parametro no encontrado'})}

            const country = await Country.findOrFail(id)
            if (country.deletedAt === null) {
                country.deletedAt = DateTime.now()
                country.save()
            }else {
                country.delete()
            }

            return response.noContent()
        } catch (error) {
            return response.internalServerError({
                message: 'Error interno del servidor al eliminar el pais',
                errors: error.messages || error.message || String(error)
            })
        }
    }

    async restore({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) { return response.status(404).json({message: 'No existe', errors: 'parametro no encontrado'})}

            const country = await Country.findOrFail(id)
            country.deletedAt = null
            country.save()

            return response.ok(country)
        } catch (error) {
            return response.internalServerError({
                message: 'Error interno del servidor al restaurar el pais',
                errors: error.messages || error.message || String(error)
            })
        }
    }
}
