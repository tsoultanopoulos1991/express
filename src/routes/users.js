const express = require('express')
const router = express.Router()
const { auth, requireAdmin } = require('../middleware/auth')
const validate = require('../validators/user')
const { index, create } = require('../controllers/userController')

router.get('/', auth, requireAdmin, index)
router.post('/', validate.createUser, create)

module.exports = router
