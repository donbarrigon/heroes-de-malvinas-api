import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class ResponseErrorService {
    public static invalidParams(response: HttpContext['response'], text:string = '') {
        return response.badRequest({
            message: 'Petición inválida',
            error: `Debe proporcionar los parametros requeridos ${text}`,
        })
    }

    public static internalServerError(response: HttpContext['response'], error: any, errorSourceData: any = null) {
        const err = {
            message:         'Error interno del servidor',
            error:           error.messages || error.message || String(error),
            errorSourceData: errorSourceData
        }
        logger.warn(err)
        return response.internalServerError(err)
    }

    public static notFound(response: HttpContext['response'], value: any) {
        return response.notFound({
            message: 'Recurso no encontrado',
            error: `El recurso solicitado '${value}' no existe o no está disponible`,
        })
    }

    public static forbidden(response: HttpContext['response'], text: string = '') {
        return response.forbidden({
            message: 'Acceso denegado',
            error: 'No tienes permiso para realizar esta accion ' + text
        })
    }
}
