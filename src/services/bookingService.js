const { Booking, BookingTicket } = require('../db')
const { AppError } = require('../errors')

const getBookings = async ({ userId, role } = {}) => {
  const where = role === 'admin' ? {} : { user_id: userId }
  return Booking.findAll({ where, include: [{ model: BookingTicket, as: 'booking_tickets' }] })
}

const createBooking = async ({ userId = null, reference_code, travel_date }, transaction) => {
  return Booking.create({ user_id: userId, reference_code, travel_date }, { transaction })
}

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    where: { id: bookingId, user_id: userId },
    include: [{ model: BookingTicket, as: 'booking_tickets' }],
  })

  if (!booking) throw new AppError('Booking not found or belongs to a different user', 404)
  if (booking.deleted_at !== null) throw new AppError('Booking already cancelled', 409)
  if (booking.booking_tickets.some((t) => t.used_at !== null))
    throw new AppError('One or more tickets have already been used', 403)
  if (new Date(booking.travel_date) < new Date())
    throw new AppError('Travel date is in the past', 422)

  await booking.update({ deleted_at: new Date() })
  return booking
}

module.exports = { getBookings, createBooking, cancelBooking }
