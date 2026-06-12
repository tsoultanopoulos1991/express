const { BookingTicket, Booking } = require('../db')
const { AppError } = require('../errors')

const getTicketsByBooking = async (bookingId, userId, role) => {
  const booking = await Booking.findOne({
    where: role === 'admin' ? { id: bookingId } : { id: bookingId, user_id: userId },
  })
  if (!booking) throw new AppError('Booking not found or belongs to a different user', 404)

  return BookingTicket.findAll({ where: { booking_id: bookingId } })
}

const createTicket = async ({ bookingId, ticket_code, userId, role }) => {
  const booking = await Booking.findOne({
    where: role === 'admin' ? { id: bookingId } : { id: bookingId, user_id: userId },
  })
  if (!booking) throw new AppError('Booking not found or belongs to a different user', 404)

  return BookingTicket.create({ booking_id: bookingId, ticket_code })
}

const useTicket = async (bookingId, ticketId, userId, role) => {
  const booking = await Booking.findOne({
    where: role === 'admin' ? { id: bookingId } : { id: bookingId, user_id: userId },
  })
  if (!booking) throw new AppError('Booking not found or belongs to a different user', 404)
  if (booking.deleted_at !== null) throw new AppError('Booking is cancelled', 409)

  const ticket = await BookingTicket.findOne({ where: { id: ticketId, booking_id: bookingId } })
  if (!ticket) throw new AppError('Ticket not found', 404)
  if (ticket.used_at !== null) throw new AppError('Ticket already used', 409)

  await ticket.update({ used_at: new Date() })
  return ticket
}

module.exports = { getTicketsByBooking, createTicket, useTicket }
