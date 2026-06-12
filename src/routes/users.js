const express = require('express')
const router = express.Router()
const { auth, requireAdmin } = require('../middleware/auth')
const validate = require('../validators/user')
const { index, show, create } = require('../controllers/userController')

router.get('/', auth, requireAdmin, index)
router.get('/:id', auth, requireAdmin, validate.userId, show)
router.post('/', validate.createUser, create)

module.exports = router
