import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    // Campos de la tabla users
    email: vine.string()
      .trim()
      .toLowerCase()
      .email()
      .maxLength(254)
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),

    password: vine.string()
      .minLength(8)
      .maxLength(32)
      .confirmed(),

    password_confirmation: vine.string(),

    // Campos de la tabla profile
    nickname: vine.string()
      .trim()
      .toLowerCase()
      .minLength(3)
      .maxLength(255)
      .regex(/^[a-z][a-z0-9\-_]*(?:\s[a-z0-9\-_]+)*[a-z0-9]$/)
      .unique(async (db, value) => {
        const profile = await db.from('profiles').where('nickname', value).first()
        return !profile
      }),

    full_name: vine.string()
      .trim()
      .minLength(3)
      .maxLength(255)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras, espacios y acentos
      .optional(),

    phone_number: vine.string()
      .trim()
      .minLength(7)
      .maxLength(20)
      .regex(/^[\+]?[0-9\s\-\(\)]+$/) // Números, espacios, guiones, paréntesis y +
      .optional(),

    discord_username: vine.string()
      .trim()
      .minLength(3)
      .maxLength(37) // Discord max length es 32 + # + 4 dígitos
      .regex(/^[a-zA-Z0-9._]+#?[0-9]{0,4}$/) // Formato Discord username
      .optional(),

    city_id: vine.number()
      .withoutDecimals()
      .positive()
      .exists(async (db, value) => {
        const city = await db.from('cities').where('id', value).first()
        return !!city
      }),

    preferences: vine.object({}).optional()
  })
)

export const updateUserProfileValidator = vine.compile(
  vine.object({
    // Campos de la tabla profile
    nickname: vine.string()
      .trim()
      .toLowerCase()
      .minLength(3)
      .maxLength(255)
      .regex(/^[a-z][a-z0-9\-_]*(?:\s[a-z0-9\-_]+)*[a-z0-9]$/)
      .unique(async (db, value) => {
        const profile = await db.from('profiles').where('nickname', value).first()
        return !profile
      }),

    full_name: vine.string()
      .trim()
      .minLength(3)
      .maxLength(255)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras, espacios y acentos
      .optional(),

    phone_number: vine.string()
      .trim()
      .minLength(7)
      .maxLength(20)
      .regex(/^[\+]?[0-9\s\-\(\)]+$/) // Números, espacios, guiones, paréntesis y +
      .optional(),

    discord_username: vine.string()
      .trim()
      .minLength(3)
      .maxLength(37) // Discord max length es 32 + # + 4 dígitos
      .regex(/^[a-zA-Z0-9._]+#?[0-9]{0,4}$/) // Formato Discord username
      .optional(),

    city_id: vine.number()
      .withoutDecimals()
      .positive()
      .exists(async (db, value) => {
        const city = await db.from('cities').where('id', value).first()
        return !!city
      }),

    preferences: vine.object({}).optional()
  })
)

export const updateUserEmailValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().maxLength(254)
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      })
  })
)

export const updateUserPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().trim().minLength(8).maxLength(32)
      .confirmed(),
  })
)
