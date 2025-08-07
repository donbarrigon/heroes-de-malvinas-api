import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class ResponseErrorService {
    public static invalidParams(response: HttpContext['response'], text:string = '') {
        return response.badRequest({
            message: 'Petición inválida',
            errors: `Debe proporcionar los parametros requeridos ${text}`,
        })
    }

    public static internalServerError(response: HttpContext['response'], error: any) {
        logger.warn(error.messages || error.message || String(error))
        return response.internalServerError({
            message: 'Error interno del servidor',
            errors: error.messages || error.message || String(error),
        })
    }

    public static notFound(response: HttpContext['response'], value: any) {
        return response.notFound({
            message: 'No existe',
            errors: 'El registro [' + value + '] no fue encontrado'
        })
    }

    public static forbidden(response: HttpContext['response'], text: string = '') {
        return response.forbidden({
            message: 'Acceso denegado',
            errors: 'No tienes permiso para realizar esta accion ' + text
        })
    }
}
