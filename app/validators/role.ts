import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new role.
 */
export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.string()
      .trim()
      .toLowerCase()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9\s]+$/)
  })
)

/**
 * Validator to validate the payload when updating
 * an existing role.
 */
export const updateRoleValidator = vine.compile(
  vine.object({
    name: vine.string()
      .trim()
      .toLowerCase()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9\s]+$/)
  })
)
