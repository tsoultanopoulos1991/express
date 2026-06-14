const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const validate = require('../validators/booking')
const { index, create, cancel } = require('../controllers/bookingController')

router.get('/', auth, index)
router.post('/', auth, validate.createBooking, create)
router.delete('/:id', auth, validate.bookingId, cancel)

module.exports = router
