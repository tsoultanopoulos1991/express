const express = require('express')
const router = express.Router()
const { auth, requireAdmin } = require('../middleware/auth')
const validate = require('../validators/booking')
const { index, show, create, cancel } = require('../controllers/bookingController')

router.get('/', auth, requireAdmin, index)
router.get('/:id', auth, validate.bookingId, show)
router.post('/', auth, validate.createBooking, create)
router.delete('/:id', auth, validate.bookingId, cancel)

module.exports = router
