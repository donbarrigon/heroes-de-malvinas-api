import type { HttpContext } from '@adonisjs/core/http'
import Country from "#models/country";
import { createCountryValidator } from '#validators/country';
import { DateTime } from 'luxon';
import ResponseErrorService from '#services/response_error_service';
import CountryPolicy from '#policies/country_policy';
import Activity from '#models/activity';

export default class CountriesController {

    async index({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('view')) {
                return ResponseErrorService.forbidden(response)
            }
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await Country.query().whereNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return response.ok(await Country.query().whereNotNull('deleted_at').paginate(page, limit))
        } catch(error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response, bouncer}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('view')) {
                return ResponseErrorService.forbidden(response)
            }
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const country = await Country.query().where('id', id).whereNull('deleted_at')
                .preload('states', (stateQuery) => {
                    stateQuery.preload('cities') // carga las cities de cada state
                }).first()
            if (country === null) {
                return ResponseErrorService.notFound(response, id)
            }

            return response.ok(country)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async store({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('create')) {
                return ResponseErrorService.forbidden(response)
            }
            const payload = await request.validateUsing(createCountryValidator)
            const country = await Country.create(payload)
            Activity.record(auth.user!, country, Activity.CREATE)

            return response.created(country)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async update({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('update')) {
                return ResponseErrorService.forbidden(response)
            }
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }
            const payload = await request.validateUsing(createCountryValidator)
            const country = await Country.query().where('id', id).whereNull('deleted_at').first()
            if (country === null) {
                return ResponseErrorService.notFound(response, id)
            }

            country.merge(payload)
            await country.save()
            Activity.record(auth.user!, country, Activity.UPDATE)

            return response.ok(country)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const country = await Country.query().where('id', id).first()
            if (country === null) {
                return ResponseErrorService.notFound(response, id)
            }

            if (country.deletedAt === null) {
                country.deletedAt = DateTime.now()
                country.save()
                Activity.record(auth.user!, country, Activity.DELETE)
            }else {
                country.delete()
                Activity.record(auth.user!, country, Activity.FORCE_DELETE)
            }

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth}: HttpContext) {
        try {
            if (await bouncer.with(CountryPolicy).denies('delete')) {
                return ResponseErrorService.forbidden(response)
            }
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }
            const country = await Country.query().where('id', id).first()
            if (country === null) {
                return ResponseErrorService.notFound(response, id)
            }
            country.deletedAt = null
            country.save()
            Activity.record(auth.user!, country, Activity.RESTORE)

            return response.ok(country)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }
}
