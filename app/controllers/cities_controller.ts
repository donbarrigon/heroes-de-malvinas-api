import type { HttpContext } from '@adonisjs/core/http'
import City from "#models/city"
import ResponseErrorService from "#services/response_error_service"
import { createCityValidator } from '#validators/city'
import { DateTime } from 'luxon'
import CityPolicy from '#policies/city_policy'
import Activity from '#models/activity'

export default class CitiesController {
    async index({request, response, bouncer}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('view')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({request, response, bouncer}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await City.query().whereNotNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response, bouncer}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('view')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const city = await City.query().where('id', id).preload('state').preload('country').whereNull('deleted_at').first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async store({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('create')) {
            return ResponseErrorService.forbidden(response)
        }
        const payload = await request.validateUsing(createCityValidator)
        try {
            const city = await City.create(payload)
            Activity.record(auth.user!, city, Activity.CREATE)

            return response.created(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async update({request, response, bouncer, auth}: HttpContext) {

        if (await bouncer.with(CityPolicy).denies('update')) {
            return ResponseErrorService.forbidden(response)
        }
        const id = request.param('id', 0)
        const payload = await request.validateUsing(createCityValidator)
        try {
            const city = await City.query().where('id', id).whereNull('deleted_at').first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }
            const changes = city.merge(payload).$dirty
            await city.save()
            Activity.record(auth.user!, city, Activity.UPDATE, changes)

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const city = await City.query().where('id', id).first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }
            city.deletedAt = DateTime.now()
            city.save()
            Activity.record(auth.user!, city, Activity.DELETE, { deletedAt: city.deletedAt })

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const city = await City.query().where('id', id).first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }
            city.deletedAt = null
            city.save()
            Activity.record(auth.user!, city, Activity.RESTORE, { deletedAt: city.deletedAt })

            return response.ok(city)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async forceDelete({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(CityPolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const city = await City.query().where('id', id).first()
            if (city === null) {
                return ResponseErrorService.notFound(response, id)
            }
            city.delete()
            Activity.record(auth.user!, city, Activity.FORCE_DELETE)

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }
}
