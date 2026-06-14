const { getBookings, createBooking, cancelBooking } = require('../services/bookingService')
const asyncHandler = require('../utils/asyncHandler')

const index = asyncHandler(async (req, res) => {
  const bookings = await getBookings({ userId: req.user.id, role: req.user.role })
  res.status(200).json(bookings)
})

const create = asyncHandler(async (req, res) => {
  const { reference_code, travel_date } = req.body
  const booking = await createBooking({ userId: req.user.id, reference_code, travel_date })
  console.info(`[bookings] created booking id=${booking.id} for user id=${req.user.id}`)
  res.status(201).json(booking)
})

const cancel = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(Number(req.params.id), req.user.id)
  console.info(`[bookings] cancelled booking id=${booking.id} by user id=${req.user.id}`)
  res.status(200).json({ message: 'Booking cancelled' })
})

module.exports = { index, create, cancel }
