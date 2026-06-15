const { body } = require('express-validator')
const validate = require('../middleware/validate')
const { SLOT_STARTS } = require('../services/availabilityService')

const webhookEvent = validate([
  body('event_id').isString().notEmpty().withMessage('event_id is required'),
  body('event').isString().notEmpty().withMessage('event is required'),
  body('supplier_id').isInt({ min: 1 }).withMessage('supplier_id must be a positive integer'),
  body('supplier_product_code').isString().notEmpty().withMessage('supplier_product_code is required'),
  // The booking payload only applies to the `created` event. Validating it conditionally lets
  // other/unknown events through to the controller, which acknowledges them gracefully (200).
  body('booking.reference_code')
    .if(body('event').equals('created'))
    .isString()
    .notEmpty()
    .withMessage('booking.reference_code is required'),
  body('booking.travel_date')
    .if(body('event').equals('created'))
    .isDate()
    .withMessage('booking.travel_date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      if (value !== today && value !== tomorrow) {
        throw new Error('booking.travel_date must be today or tomorrow')
      }
      return true
    }),
  body('booking.slot_start')
    .if(body('event').equals('created'))
    .isIn(SLOT_STARTS)
    .withMessage(`booking.slot_start must be one of: ${SLOT_STARTS.join(', ')}`),
])

module.exports = { webhookEvent }
