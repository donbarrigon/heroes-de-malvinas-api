import Activity from '#models/activity'
import State from '#models/state'
import StatePolicy from '#policies/state_policy'
import ResponseErrorService from '#services/response_error_service'
import { createStateValidator } from '#validators/state'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class StatesController {
    async index({response, request, bouncer}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('view')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return await State.query().whereNull('deleted_at').preload('cities').paginate(page, limit)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async trashed({response, request, bouncer}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const page = request.input('page', 1)
            const limit = request.input('per_page', 10)
            return await State.query().whereNotNull('deleted_at').preload('cities').paginate(page, limit)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async show({request, response, bouncer}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('view')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const state = await State.query().where('id', id).whereNull('deleted_at').preload('cities').preload('country').first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }
            return response.ok(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async store({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('create')) {
            return ResponseErrorService.forbidden(response)
        }
        const payload = await request.validateUsing(createStateValidator)
        try {
            const state = await State.create(payload)
            Activity.record(auth.user!, state, Activity.CREATE)

            return response.created(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async update({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('update')) {
            return ResponseErrorService.forbidden(response)
        }
        const id = request.param('id', 0)
        const payload = await request.validateUsing(createStateValidator)
        try {
            const state = await State.query().where('id', id).whereNull('deleted_at').first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }
            state.merge(payload)
            await state.save()
            Activity.record(auth.user!, state, Activity.UPDATE)

            return response.ok(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async destroy({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const state = await State.query().where('id', id).first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }
            state.deletedAt = DateTime.now()
            state.save()
            Activity.record(auth.user!, state, Activity.DELETE, { deletedAt: state.deletedAt })

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async restore({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const state = await State.query().where('id', id).first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }
            state.deletedAt = null
            state.save()
            Activity.record(auth.user!, state, Activity.RESTORE, { deletedAt: state.deletedAt })

            return response.ok(state)
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

    async forceDelete({request, response, bouncer, auth}: HttpContext) {
        if (await bouncer.with(StatePolicy).denies('delete')) {
            return ResponseErrorService.forbidden(response)
        }
        try {
            const id = request.param('id', 0)
            const state = await State.query().where('id', id).first()
            if (state === null) {
                return ResponseErrorService.notFound(response, id)
            }
            state.delete()
            Activity.record(auth.user!, state, Activity.FORCE_DELETE)

            return response.noContent()
        } catch (error) {
            return ResponseErrorService.internalServerError(response, error)
        }
    }

}
