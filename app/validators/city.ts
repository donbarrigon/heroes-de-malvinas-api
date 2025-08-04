import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new city.
 */
export const createCityValidator = vine.compile(
  vine.object({})
)

/**
 * Validator to validate the payload when updating
 * an existing city.
 */
export const updateCityValidator = vine.compile(
  vine.object({})
)