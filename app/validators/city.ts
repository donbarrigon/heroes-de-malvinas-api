import vine from '@vinejs/vine'

export const createCityValidator = vine.compile(
  vine.object({
    id: vine.number().withoutDecimals().positive(),
    name: vine.string().trim().minLength(1).maxLength(255),

    state_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const state = await db.from('states').where('id', value).first()
        return !!state
      }),
    state_code: vine.string().trim().minLength(1).maxLength(10),
    state_name: vine.string().trim().minLength(1).maxLength(255),

    country_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const country = await db.from('countries').where('id', value).first()
        return !!country
      }),
    country_code: vine.string().trim().minLength(2).maxLength(10),
    country_name: vine.string().trim().minLength(1).maxLength(255),

    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    wiki_data_id: vine.string().trim().maxLength(50).regex(/^Q\d+$/).optional(), // Formato WikiData: Q + números
  })
)

export const updateCityValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),

    state_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const state = await db.from('states').where('id', value).first()
        return !!state
      }).optional(),
    state_code: vine.string().trim().minLength(1).maxLength(10).optional(),
    state_name: vine.string().trim().minLength(1).maxLength(255).optional(),

    country_id: vine.number().withoutDecimals().positive().exists(async (db, value) => {
        const country = await db.from('countries').where('id', value).first()
        return !!country
      }).optional(),
    country_code: vine.string().trim().minLength(2).maxLength(10).optional(),
    country_name: vine.string().trim().minLength(1).maxLength(255).optional(),

    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    wiki_data_id: vine.string().trim().maxLength(50).regex(/^Q\d+$/).optional(), // Formato WikiData: Q + números
  })
)
