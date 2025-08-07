import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class MailService {
  static fromAddress = env.get('SMTP_USERNAME')
  static fromName = env.get('SMTP_FROMNAME')

  static async sendConfirmationEmail(email: string, token: string): Promise<boolean> {
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
        return true
      } catch (error) {
        console.error(`Intento ${attempt} fallido:`, error)
        // por aki mas delante pongo logica para guardar logs
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
        }
      }
    }

    return false
  }

    static async sendNotification(email: string, subject: string, content: string) {
        await mail.use('smtp').send((message) => {
            message
                .from(MailService.fromAddress, MailService.fromName)
                .to(email)
                .subject(subject)
                .html(`
                <p>${content}</p>
                `)
        })
    }
}
