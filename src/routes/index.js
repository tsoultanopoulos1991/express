const express = require('express')
const router = express.Router()

router.use('/v1/users', require('./users'))
router.use('/v1/bookings', require('./bookings'))

module.exports = router
