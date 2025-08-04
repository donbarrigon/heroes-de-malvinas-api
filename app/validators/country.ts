import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new country.
 */
export const createCountryValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),

    iso_3: vine.string().trim().maxLength(3).unique({table: 'countries', column: 'iso_3'}),
    iso_2: vine.string().trim().maxLength(2).unique({table: 'countries', column: 'iso_2'}),

    numeric_code: vine.string().trim().optional().nullable(),
    phonecode: vine.string().trim().optional().nullable(),
    capital: vine.string().trim().optional().nullable(),

    currency: vine.string().trim().optional().nullable(),
    currency_name: vine.string().trim().optional().nullable(),
    currency_symbol: vine.string().trim().optional().nullable(),

    tld: vine.string().trim().optional().nullable(),
    native: vine.string().trim().optional().nullable(),
    region: vine.string().trim().optional().nullable(),
    region_id: vine.number().optional().nullable(),
    subregion: vine.string().trim().optional().nullable(),
    subregion_id: vine.number().optional().nullable(),

    nationality: vine.string().trim().optional().nullable(),
    latitude: vine.number().optional().nullable(),
    longitude: vine.number().optional().nullable(),

    emoji: vine.string().trim().optional().nullable(),
    emoji_u: vine.string().trim().optional().nullable(),

    timezones: vine.object({}).optional().nullable(),
    translations: vine.object({}).optional().nullable(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing country.
 */
export const updateCountryValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),

    iso_3: vine.string().trim().maxLength(3).unique({table: 'countries', column: 'iso_3'}),
    iso_2: vine.string().trim().maxLength(2).unique({table: 'countries', column: 'iso_2'}),

    numeric_code: vine.string().trim().optional().nullable(),
    phonecode: vine.string().trim().optional().nullable(),
    capital: vine.string().trim().optional().nullable(),

    currency: vine.string().trim().optional().nullable(),
    currency_name: vine.string().trim().optional().nullable(),
    currency_symbol: vine.string().trim().optional().nullable(),

    tld: vine.string().trim().optional().nullable(),
    native: vine.string().trim().optional().nullable(),
    region: vine.string().trim().optional().nullable(),
    region_id: vine.number().optional().nullable(),
    subregion: vine.string().trim().optional().nullable(),
    subregion_id: vine.number().optional().nullable(),

    nationality: vine.string().trim().optional().nullable(),
    latitude: vine.number().optional().nullable(),
    longitude: vine.number().optional().nullable(),

    emoji: vine.string().trim().optional().nullable(),
    emoji_u: vine.string().trim().optional().nullable(),

    timezones: vine.object({}).optional().nullable(),
    translations: vine.object({}).optional().nullable(),
  })
)
