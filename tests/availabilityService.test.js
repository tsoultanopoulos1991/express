jest.mock('../src/redis', () => ({
  get: jest.fn(),
  setex: jest.fn(),
  ttl: jest.fn(),
}))

const redis = require('../src/redis')
const { getAvailability, decrementSlot, cacheKey, CACHE_TTL } = require('../src/services/availabilityService')

const PRODUCT_ID = 'product-1'

const mockData = {
  '2026-07-01': {
    slots: [
      { start: '09:00', available_tickets: 10, price: 100 },
      { start: '10:00', available_tickets: 5, price: 100 },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getAvailability', () => {
  it('cache hit — returns cached data without calling upstream', async () => {
    redis.get.mockResolvedValue(JSON.stringify(mockData))

    const result = await getAvailability(PRODUCT_ID)

    expect(result).toEqual(mockData)
    expect(redis.setex).not.toHaveBeenCalled()
  })

  it('cache miss — fetches from upstream and stores result', async () => {
    redis.get.mockResolvedValue(null)
    redis.setex.mockResolvedValue('OK')

    const result = await getAvailability(PRODUCT_ID)

    expect(redis.setex).toHaveBeenCalledTimes(1)
    expect(typeof result).toBe('object')
  })

  it('cache miss — stores result with correct TTL', async () => {
    redis.get.mockResolvedValue(null)
    redis.setex.mockResolvedValue('OK')

    await getAvailability(PRODUCT_ID)

    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey(PRODUCT_ID),
      CACHE_TTL,
      expect.any(String)
    )
  })
})

describe('decrementSlot', () => {
  it('decrements the correct slot in-place', async () => {
    redis.get.mockResolvedValue(JSON.stringify(mockData))
    redis.ttl.mockResolvedValue(1800)
    redis.setex.mockResolvedValue('OK')

    await decrementSlot(PRODUCT_ID, '2026-07-01', '09:00')

    const stored = JSON.parse(redis.setex.mock.calls[0][2])
    const slot = stored['2026-07-01'].slots.find((s) => s.start === '09:00')
    expect(slot.available_tickets).toBe(9)
  })

  it('preserves the remaining TTL on decrement', async () => {
    redis.get.mockResolvedValue(JSON.stringify(mockData))
    redis.ttl.mockResolvedValue(1800)
    redis.setex.mockResolvedValue('OK')

    await decrementSlot(PRODUCT_ID, '2026-07-01', '09:00')

    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey(PRODUCT_ID),
      1800,
      expect.any(String)
    )
  })

  it('throws 404 when cache is expired', async () => {
    redis.get.mockResolvedValue(null)

    await expect(decrementSlot(PRODUCT_ID, '2026-07-01', '09:00')).rejects.toMatchObject({
      status: 404,
    })
    expect(redis.setex).not.toHaveBeenCalled()
  })
})
