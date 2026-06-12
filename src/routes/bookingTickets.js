const express = require('express')
const router = express.Router({ mergeParams: true })
const { auth } = require('../middleware/auth')
const validate = require('../validators/bookingTicket')
const { index, create, use } = require('../controllers/bookingTicketController')

router.get('/', auth, validate.bookingId, index)
router.post('/', auth, validate.bookingId, validate.createTicket, create)
router.patch('/:ticketId/use', auth, validate.bookingId, validate.ticketId, use)

module.exports = router
