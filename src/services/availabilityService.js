// Availability service — cache-aside pattern with Redis.
// On GET: return cached data if present, otherwise fetch from simulated upstream and cache.
// On booking: decrement the correct slot in-place without resetting the TTL.
// If the cache has expired at decrement time, throw 404 — upstream is not re-fetched (per spec).
const redis = require('../redis')
const { AppError } = require('../errors')

// TTL matches upstream refresh rate (1h). Staleness is bounded by in-place decrements on booking.
const CACHE_TTL = Number(process.env.AVAILABILITY_CACHE_TTL) || 3600

const SLOT_STARTS = ['09:00', '10:30', '12:00']

const formatDate = (date) => date.toISOString().split('T')[0]

const generateSlots = () =>
  SLOT_STARTS.map((start) => ({ start, available_tickets: 10, price: 100 }))

// Simulates an upstream scheduling API that refreshes data every hour.
const getUpstreamAvailability = (productId) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return {
    [formatDate(today)]: { slots: generateSlots() },
    [formatDate(tomorrow)]: { slots: generateSlots() },
  }
}

const cacheKey = (productId) => `availability:${productId}`

const getAvailability = async (productId) => {
  try {
    const cached = await redis.get(cacheKey(productId))
    if (cached) {
      console.info(`[availability] cache hit for product ${productId}`)
      return JSON.parse(cached)
    }

    console.info(`[availability] cache miss for product ${productId} — fetching upstream`)
    const data = getUpstreamAvailability(productId)
    await redis.setex(cacheKey(productId), CACHE_TTL, JSON.stringify(data))
    return data
  } catch (err) {
    // Redis unavailable — bypass cache and serve upstream data directly
    console.warn(`[availability] Redis unavailable, serving uncached data: ${err.message}`)
    return getUpstreamAvailability(productId)
  }
}

const decrementSlot = async (productId, date, start) => {
  const cached = await redis.get(cacheKey(productId))
  if (!cached) {
    // Cache expired at decrement time — surface 404, do not re-fetch upstream (per spec)
    console.warn(`[availability] cache expired for product ${productId} — cannot decrement`)
    throw new AppError('Availability cache expired', 404)
  }

  const data = JSON.parse(cached)
  const day = data[date]
  if (!day) return false

  const slot = day.slots.find((s) => s.start === start)
  if (!slot) return false

  slot.available_tickets = Math.max(0, slot.available_tickets - 1)

  // Preserve remaining TTL instead of resetting to CACHE_TTL on every decrement
  const ttl = await redis.ttl(cacheKey(productId))
  await redis.setex(cacheKey(productId), ttl, JSON.stringify(data))

  console.info(`[availability] decremented slot ${date} ${start} for product ${productId}`)
  return true
}

module.exports = { getAvailability, decrementSlot, cacheKey, CACHE_TTL, SLOT_STARTS }
