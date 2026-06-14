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
    reference_code: booking.reference_code,
    travel_date: booking.travel_date,
  })

  try {
    await decrementSlot(productSupplier.product_code, booking.travel_date, booking.slot_start)
  } catch (err) {
    // Cache expired at decrement time → 404 (per spec). Roll back the booking we just created
    // so the operator's retry (once the cache is repopulated) creates it cleanly.
    await newBooking.destroy()
    throw err
  }

  console.info(`[webhook] booking ${newBooking.id} created for event ${event_id}`)
  return newBooking
}

module.exports = { handleCreated }
