const { param } = require('express-validator')
const validate = require('../middleware/validate')

const productId = validate([
  param('productId').isString().notEmpty().withMessage('productId is required'),
])

module.exports = { productId }
