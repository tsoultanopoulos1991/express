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

const payload = {
  event_id: 'evt-001',
  supplier_id: 1,
  supplier_product_code: 'PROD-EXT-001',
  booking: {
    user_id: 1,
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
      userId: 1,
      reference_code: 'REF-001',
      travel_date: '2026-07-01',
    })
    expect(decrementSlot).toHaveBeenCalledWith('product-1', '2026-07-01', '09:00')
    expect(result).toEqual({ id: 1 })
  })

  it('creates booking even when cache is expired (decrement returns false)', async () => {
    ProductSupplier.findOne.mockResolvedValue({ product_code: 'product-1' })
    createBooking.mockResolvedValue({ id: 2 })
    decrementSlot.mockResolvedValue(false)

    const result = await handleCreated(payload)

    expect(createBooking).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: 2 })
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
