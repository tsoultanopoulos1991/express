const express = require('express')
const router = express.Router()
const validate = require('../validators/availability')
const { index } = require('../controllers/availabilityController')

router.get('/:productId/availabilities', validate.productId, index)

module.exports = router
