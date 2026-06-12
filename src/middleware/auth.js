const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[auth] missing or malformed Authorization header')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    console.info(`[auth] authenticated ${req.user.role} id=${req.user.id}`)
    next()
  } catch (err) {
    console.warn(`[auth] invalid token: ${err.message}`)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    console.warn(`[auth] forbidden: user id=${req.user?.id} is not admin`)
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

module.exports = { auth, requireAdmin }
