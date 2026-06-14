jest.mock('../src/db', () => ({
  ProductSupplier: { findOne: jest.fn() },
}))

jest.mock('../src/services/bookingService', () => ({
  createBooking: jest.fn(),
}))

jest.mock('../src/services/availabilityService', () => ({
  decrementSlot: jest.fn(),
}))

const { ProductSupplier } = require('../src/db')
const { createBooking } = require('../src/services/bookingService')
const { decrementSlot } = require('../src/services/availabilityService')
const { handleCreated } = require('../src/services/webhookService')
const { AppError } = require('../src/errors')

const payload = {
  event_id: 'evt-001',
  supplier_id: 1,
  supplier_product_code: 'PROD-EXT-001',
  booking: {
    reference_code: 'REF-001',
    travel_date: '2026-07-01',
    slot_start: '09:00',
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleCreated', () => {
  it('creates booking and decrements slot when product is found', async () => {
    ProductSupplier.findOne.mockResolvedValue({ product_code: 'product-1' })
    createBooking.mockResolvedValue({ id: 1 })
    decrementSlot.mockResolvedValue(true)

    const result = await handleCreated(payload)

    expect(createBooking).toHaveBeenCalledWith({
      reference_code: 'REF-001',
      travel_date: '2026-07-01',
    })
    expect(decrementSlot).toHaveBeenCalledWith('product-1', '2026-07-01', '09:00')
    expect(result).toEqual({ id: 1 })
  })

  it('rolls back the booking and throws 404 when cache is expired at decrement time', async () => {
    const destroy = jest.fn()
    ProductSupplier.findOne.mockResolvedValue({ product_code: 'product-1' })
    createBooking.mockResolvedValue({ id: 2, destroy })
    decrementSlot.mockRejectedValue(new AppError('Availability cache expired', 404))

    await expect(handleCreated(payload)).rejects.toMatchObject({ status: 404 })

    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('throws 404 when product is not found', async () => {
    ProductSupplier.findOne.mockResolvedValue(null)

    await expect(handleCreated(payload)).rejects.toMatchObject({
      message: 'Product not found',
      status: 404,
    })

    expect(createBooking).not.toHaveBeenCalled()
    expect(decrementSlot).not.toHaveBeenCalled()
  })
})
