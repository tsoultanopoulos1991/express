jest.mock('../src/db', () => ({
  Booking: { findOne: jest.fn() },
  BookingTicket: {},
}))

const { Booking } = require('../src/db')
const { cancelBooking } = require('../src/services/bookingService')

// Future date so the 422 (past travel_date) guard isn't hit unless a test opts in.
const FUTURE = '2999-01-01'

const makeBooking = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  travel_date: FUTURE,
  deleted_at: null,
  booking_tickets: [],
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

// Guard order per the spec: 404 → 409 → 403 → 422.
describe('cancelBooking', () => {
  it('throws 404 when the booking is not found or belongs to another user', async () => {
    Booking.findOne.mockResolvedValue(null)

    await expect(cancelBooking(1, 1)).rejects.toMatchObject({ status: 404 })
  })

  it('throws 409 when the booking is already cancelled', async () => {
    Booking.findOne.mockResolvedValue(makeBooking({ deleted_at: new Date() }))

    await expect(cancelBooking(1, 1)).rejects.toMatchObject({ status: 409 })
  })

  it('throws 403 when one or more tickets have been used', async () => {
    Booking.findOne.mockResolvedValue(makeBooking({ booking_tickets: [{ used_at: new Date() }] }))

    await expect(cancelBooking(1, 1)).rejects.toMatchObject({ status: 403 })
  })

  it('throws 422 when the travel date is in the past', async () => {
    Booking.findOne.mockResolvedValue(makeBooking({ travel_date: '2000-01-01' }))

    await expect(cancelBooking(1, 1)).rejects.toMatchObject({ status: 422 })
  })

  it('soft-deletes the booking on success', async () => {
    const booking = makeBooking()
    Booking.findOne.mockResolvedValue(booking)

    await cancelBooking(1, 1)

    expect(booking.update).toHaveBeenCalledWith({ deleted_at: expect.any(Date) })
  })
})
