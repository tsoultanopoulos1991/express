const express = require('express')
const router = express.Router()
const { webhookEvent } = require('../validators/webhook')
const { handle } = require('../controllers/webhookController')

router.post('/', webhookEvent, handle)

module.exports = router
