import type { HttpContext } from '@adonisjs/core/http'
import City from "#models/city"
import ResponseErrorService from "#services/response_error_service"
import { createCityValidator } from '#validators/city'
import { DateTime } from 'luxon'

export default class CitiesController {
    async index({request, response}: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({request, response}: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNotNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const city = await City.query().where('id', id).preload('state').preload('country').whereNull('deleted_at').first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async store({request, response}: HttpContext) {
        try {
            const payload = await request.validateUsing(createCityValidator)
            return response.created(await City.create(payload))
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async update({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const payload = await request.validateUsing(createCityValidator)
            const city = await City.query().where('id', id).whereNull('deleted_at').first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }

            city.merge(payload)
            await city.save()

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const city = await City.query().where('id', id).first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }

            if (city.deletedAt === null) {
                city.deletedAt = DateTime.now()
                city.save()
            } else {
                city.delete()
            }

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }
}
