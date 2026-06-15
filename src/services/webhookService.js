const { ProductSupplier, sequelize } = require('../db')
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

  // Wrap the booking write in a transaction and let the decrement gate the commit: if the cache
  // has expired, decrementSlot throws 404 (before touching Redis) and the booking is rolled back,
  // so the operator's retry — once availability is re-cached — creates it cleanly. (Per spec.)
  const newBooking = await sequelize.transaction(async (transaction) => {
    const created = await createBooking(
      { reference_code: booking.reference_code, travel_date: booking.travel_date },
      transaction
    )
    await decrementSlot(productSupplier.product_code, booking.travel_date, booking.slot_start)
    return created
  })

  console.info(`[webhook] booking ${newBooking.id} created for event ${event_id}`)
  return newBooking
}

module.exports = { handleCreated }
