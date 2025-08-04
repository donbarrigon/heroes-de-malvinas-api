import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new permission.
 */
export const createPermissionValidator = vine.compile(
  vine.object({})
)

/**
 * Validator to validate the payload when updating
 * an existing permission.
 */
export const updatePermissionValidator = vine.compile(
  vine.object({})
)