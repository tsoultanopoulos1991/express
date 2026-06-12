const { Booking, BookingTicket } = require('../db')
const { AppError } = require('../errors')

const getBookings = async ({ userId, role } = {}) => {
  const where = role === 'admin' ? {} : { user_id: userId }
  return Booking.findAll({ where, include: [{ model: BookingTicket }] })
}

const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    where: { id: bookingId, user_id: userId },
    include: [{ model: BookingTicket }],
  })

  if (!booking) throw new AppError('Booking not found', 404)

  return booking
}

const createBooking = async ({ userId, reference_code, travel_date }) => {
  return Booking.create({ user_id: userId, reference_code, travel_date })
}

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    where: { id: bookingId, user_id: userId },
    include: [{ model: BookingTicket }],
  })

  if (!booking) throw new AppError('Booking not found', 404)
  if (booking.deleted_at !== null) throw new AppError('Booking already cancelled', 409)
  if (booking.BookingTickets.some((t) => t.used_at !== null))
    throw new AppError('One or more tickets have already been used', 403)
  if (new Date(booking.travel_date) < new Date())
    throw new AppError('Travel date is in the past', 422)

  await booking.update({ deleted_at: new Date() })
  return booking
}

module.exports = { getBookings, getBookingById, createBooking, cancelBooking }
