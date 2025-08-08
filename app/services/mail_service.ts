import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'

export default class MailService {
    static fromAddress = env.get('SMTP_USERNAME')
    static fromName = env.get('SMTP_FROMNAME')

    static async sendConfirmationEmail(user: User): Promise<void> {
        const email = user.email
        let token = ''
        try {
            token = (await user.createToken('verification')).token
        } catch (error) {
            return logger.error({ message: 'Error al crear el token de verificación:', data: user, error })
        }

        const confirmUrl = `https://donbarrigon.com/confirm?token=${token}`
        const maxRetries = 3

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await mail.use('smtp').send((message) => {
                message
                    .from(MailService.fromAddress, MailService.fromName)
                    .to(email)
                    .subject('Confirma tu correo')
                    .html(`
                    <h1>Bienvenido a Héroes de Malvinas</h1>
                    <p>Gracias por registrarte. Haz clic en el siguiente enlace para confirmar tu correo:</p>
                    <a href="${confirmUrl}">${confirmUrl}</a>
                    `)
                })
                return
            } catch (error) {
                logger.error({ message: 'Error al enviar el correo de confirmación:', data: user, retry: attempt, errors: error.messages || error.message || String(error) })
                if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
                }
            }
        }
    }

    static async sendUpdatePasswordEmail(user: User): Promise<void> {
        try {
            MailService.sendNotification(user.email,
                'Actualización de contraseña',
                'Parse su contraseña fue cambiada, si no fue usted hablele al jefe del clan')
        } catch (error) {
            logger.error({ message: 'Error al enviar notificacion por correo:', data: this, error })
        }
    }

    static async sendResetPasswordEmail(user:User, password: string): Promise<void> {
        try {
            MailService.sendNotification(user.email,
                'Resstablecimiento de contraseña',
                'cucho ya le colocamos la nueva clave pillela: ' + password)
        } catch (error) {
            logger.error({ message: 'Error al enviar el correo de restablecimiento de contraseña:', data: this, error })
        }
    }

    static async sendNotification(email: string, subject: string, content: string) {
        const maxRetries = 3

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await mail.use('smtp').send((message) => {
                    message
                        .from(MailService.fromAddress, MailService.fromName)
                        .to(email)
                        .subject(subject)
                        .html(`
                        <p>${content}</p>
                        `)
                })
                return
            } catch (error) {
                logger.error({ message: 'Error al enviar el correo de notificación:', data: email, retry: attempt, errors: error.messages || error.message || String(error) })
                if (attempt < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
                }
            }
        }
    }
}
