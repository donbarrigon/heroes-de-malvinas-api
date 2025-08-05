import vine from '@vinejs/vine'

/**
 * Validaciones para crear un estado
 */
export const createStateValidator = vine.compile(
  vine.object({
    id: vine.number().withoutDecimals().positive(),
    name: vine.string().trim().minLength(1).maxLength(255),

    country_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const country = await db.from('countries').where('id', value).first()
        return !!country
      }),
    country_code: vine.string().trim().minLength(2).maxLength(10),
    country_name: vine.string().trim().minLength(1).maxLength(255),

    iso_2: vine.string().trim().minLength(2).maxLength(2),
    fips_code: vine.string().trim().maxLength(10).optional(),
    type: vine.string().trim().maxLength(50).optional(),
    level: vine.string().trim().maxLength(50).optional(),
    parent_id: vine.number().withoutDecimals().positive().optional(),

    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
  })
)

/**
 * Validaciones para actualizar un estado
 */
export const updateStateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),

    country_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const country = await db.from('countries').where('id', value).first()
        return !!country
      }).optional(),
    country_code: vine.string().trim().minLength(2).maxLength(10).optional(),
    country_name: vine.string().trim().minLength(1).maxLength(255).optional(),

    iso_2: vine.string().trim().minLength(2).maxLength(2).optional(),
    fips_code: vine.string().trim().maxLength(10).optional(),
    type: vine.string().trim().maxLength(50).optional(),
    level: vine.string().trim().maxLength(50).optional(),
    parent_id: vine.number().withoutDecimals().positive().optional(),

    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
  })
)
