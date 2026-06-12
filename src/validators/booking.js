const { body, param } = require('express-validator')
const validate = require('../middleware/validate')

const createBooking = validate([
  body('reference_code').isString().notEmpty().withMessage('reference_code is required'),
  body('travel_date').isDate().withMessage('travel_date must be a valid date (YYYY-MM-DD)'),
])

const bookingId = validate([
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
])

module.exports = { createBooking, bookingId }
