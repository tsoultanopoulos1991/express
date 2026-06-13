const { body } = require('express-validator')
const validate = require('../middleware/validate')

const webhookEvent = validate([
  body('event_id').isString().notEmpty().withMessage('event_id is required'),
  body('event').isString().notEmpty().withMessage('event is required'),
  body('supplier_id').isInt({ min: 1 }).withMessage('supplier_id must be a positive integer'),
  body('supplier_product_code').isString().notEmpty().withMessage('supplier_product_code is required'),
  body('booking.user_id').isInt({ min: 1 }).withMessage('booking.user_id must be a positive integer'),
  body('booking.reference_code').isString().notEmpty().withMessage('booking.reference_code is required'),
  body('booking.travel_date').isDate().withMessage('booking.travel_date must be a valid date (YYYY-MM-DD)'),
  body('booking.slot_start')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('booking.slot_start must be in HH:MM format'),
])

module.exports = { webhookEvent }
