import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new state.
 */
export const createStateValidator = vine.compile(
  vine.object({})
)

/**
 * Validator to validate the payload when updating
 * an existing state.
 */
export const updateStateValidator = vine.compile(
  vine.object({})
)