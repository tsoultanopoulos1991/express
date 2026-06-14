const Redis = require('ioredis')

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  enableOfflineQueue: false, // throw immediately when Redis is unavailable instead of queuing
  retryStrategy: () => null, // disable reconnection attempts to avoid silent command buildup
})

redis.on('connect', () => console.info('[redis] connected'))
redis.on('error', (err) => console.error('[redis] error:', err.message))

module.exports = redis
