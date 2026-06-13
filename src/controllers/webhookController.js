const { handleCreated } = require('../services/webhookService')
const asyncHandler = require('../utils/asyncHandler')

const SUPPORTED_EVENTS = ['created']

const handle = asyncHandler(async (req, res) => {
  const { event, event_id, supplier_id, supplier_product_code, booking } = req.body

  if (!SUPPORTED_EVENTS.includes(event)) {
    console.warn(`[webhook] unknown event type "${event}" for event_id=${event_id} — ignoring`)
    return res.status(200).json({ message: `Event type "${event}" is not supported — ignored` })
  }

  const newBooking = await handleCreated({ event_id, supplier_id, supplier_product_code, booking })
  res.status(201).json({ message: 'Booking created', booking_id: newBooking.id })
})

module.exports = { handle }
