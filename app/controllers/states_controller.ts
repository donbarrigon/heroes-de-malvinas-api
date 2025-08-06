import State from '#models/state'
import ResponseErrorService from '#services/response_error_service'
import { createStateValidator } from '#validators/state'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class StatesController {
    async index({response, request}: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return await State.query().whereNull('deleted_at').preload('cities').paginate(page, limit)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({response, request}: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return await State.query().whereNotNull('deleted_at').preload('cities').paginate(page, limit)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const state = await State.query().where('id', id).whereNull('deleted_at').preload('cities').preload('country').first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }

            return response.ok(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async store({request, response}: HttpContext) {
        try {
            const payload = await request.validateUsing(createStateValidator)
            return response.created(await State.create(payload))
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

            const payload = await request.validateUsing(createStateValidator)
            const state = await State.query().where('id', id).whereNull('deleted_at').first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }

            state.merge(payload)
            await state.save()

            return response.ok(state)
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

            const state = await State.query().where('id', id).first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }

            if (state.deletedAt === null) {
                state.deletedAt = DateTime.now()
                state.save()
            } else {
                state.delete()
            }

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response}: HttpContext) {
        try {
            const id = request.param('id', 0)
            if (id === 0) {
                return ResponseErrorService.invalidParams(response, "id")
            }

            const state = await State.query().where('id', id).first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }

            state.deletedAt = null
            state.save()

            return response.ok(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

}
