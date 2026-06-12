const { getTicketsByBooking, createTicket, useTicket } = require('../services/bookingTicketService')
const asyncHandler = require('../utils/asyncHandler')

const index = asyncHandler(async (req, res) => {
  const tickets = await getTicketsByBooking(
    Number(req.params.bookingId),
    req.user.id,
    req.user.role
  )
  res.status(200).json(tickets)
})

const create = asyncHandler(async (req, res) => {
  const ticket = await createTicket({
    bookingId: Number(req.params.bookingId),
    ticket_code: req.body.ticket_code,
    userId: req.user.id,
    role: req.user.role,
  })
  console.info(`[tickets] created ticket id=${ticket.id} for booking id=${req.params.bookingId}`)
  res.status(201).json(ticket)
})

const use = asyncHandler(async (req, res) => {
  const ticket = await useTicket(
    Number(req.params.bookingId),
    Number(req.params.ticketId),
    req.user.id,
    req.user.role
  )
  console.info(`[tickets] used ticket id=${ticket.id}`)
  res.status(200).json(ticket)
})

module.exports = { index, create, use }
