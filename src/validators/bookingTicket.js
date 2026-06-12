const { body, param } = require('express-validator')
const validate = require('../middleware/validate')

const createTicket = validate([
  body('ticket_code').isString().notEmpty().withMessage('ticket_code is required'),
])

const bookingId = validate([
  param('bookingId').isInt({ min: 1 }).withMessage('bookingId must be a positive integer'),
])

const ticketId = validate([
  param('ticketId').isInt({ min: 1 }).withMessage('ticketId must be a positive integer'),
])

module.exports = { createTicket, bookingId, ticketId }
