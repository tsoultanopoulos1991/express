const express = require('express')
const router = express.Router()
const validate = require('../validators/availability')
const { auth, requireAdmin } = require('../middleware/auth')
const { index } = require('../controllers/availabilityController')
const { list } = require('../controllers/productSuppliersController')

router.get('/', auth, requireAdmin, list)
router.get('/:productId/availabilities', validate.productId, index)

module.exports = router
