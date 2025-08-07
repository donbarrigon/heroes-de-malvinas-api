import type { HttpContext } from '@adonisjs/core/http'
import City from "#models/city"
import ResponseErrorService from "#services/response_error_service"
import { createCityValidator } from '#validators/city'
import { DateTime } from 'luxon'
import CityPolicy from '#policies/city_policy'
import Activity from '#models/activity'

export default class CitiesController {
    async index({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('view')) {
                return ResponseErrorService.forbidden(response)
            }
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNotNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('view')) {
                return ResponseErrorService.forbidden(response)
            }
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

    async store({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('create')) {
                return ResponseErrorService.forbidden(response)
            }
            const payload = await request.validateUsing(createCityValidator)
            return response.created(await City.create(payload))
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async update({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('update')) {
                return ResponseErrorService.forbidden(response)
            }
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

    async destroy({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
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
                Activity.record(auth.user!, city, Activity.DELETE)
            } else {
                city.delete()
                Activity.record(auth.user!, city, Activity.FORCE_DELETE)
            }

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CityPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const city = await City.query().where('id', id).first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }

            city.deletedAt = null
            city.save()
            Activity.record(auth.user!, city, Activity.RESTORE)

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }
}
