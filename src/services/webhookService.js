const { ProductSupplier } = require('../db')
const { createBooking } = require('./bookingService')
const { decrementSlot } = require('./availabilityService')
const { AppError } = require('../errors')

const handleCreated = async ({ event_id, supplier_id, supplier_product_code, booking }) => {
  console.info(`[webhook] processing created event ${event_id}`)

  const productSupplier = await ProductSupplier.findOne({
    where: { supplier_id, supplier_product_code },
  })

  if (!productSupplier) {
    throw new AppError('Product not found', 404)
  }

  const newBooking = await createBooking({
    userId: booking.user_id,
    reference_code: booking.reference_code,
    travel_date: booking.travel_date,
  })

  const decremented = await decrementSlot(
    productSupplier.product_code,
    booking.travel_date,
    booking.slot_start
  )

  if (!decremented) {
    console.warn(`[webhook] availability cache expired for product ${productSupplier.product_code} — decrement skipped`)
  }

  console.info(`[webhook] booking ${newBooking.id} created for event ${event_id}`)
  return newBooking
}

module.exports = { handleCreated }
