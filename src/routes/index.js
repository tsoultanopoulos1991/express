const express = require('express')
const router = express.Router()

router.use('/v1/users', require('./users'))
router.use('/v1/bookings', require('./bookings'))
router.use('/v1/products', require('./products'))
router.use('/v1/bookings/:bookingId/tickets', require('./bookingTickets'))
router.use('/v1/webhook', require('./webhook'))

module.exports = router
