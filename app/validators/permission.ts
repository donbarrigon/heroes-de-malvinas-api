import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new permission.
 */
export const createPermissionValidator = vine.compile(
  vine.object({
    name: vine.string()
      .trim()
      .toLowerCase()
      .minLength(5)
      .maxLength(255)
      .regex(/^[a-z][a-z0-9\-_]*(?:\s[a-z0-9\-_]+)*[a-z0-9]$/)
  })
)

/**
 * Validator to validate the payload when updating
 * an existing permission.
 */
export const updatePermissionValidator = vine.compile(
  vine.object({
    name: vine.string()
      .trim()
      .toLowerCase()
      .minLength(5)
      .maxLength(255)
      .regex(/^[a-z][a-z0-9\-_]*(?:\s[a-z0-9\-_]+)*[a-z0-9]$/)
  })
)
