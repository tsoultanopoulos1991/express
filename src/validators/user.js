const { body, param } = require('express-validator')
const validate = require('../middleware/validate')

const createUser = validate([
  body('email').isEmail().withMessage('email must be a valid email address'),
])

const userId = validate([
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
])

module.exports = { createUser, userId }
