const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      error: err.message,
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    })
  }

  // e.g. creating a booking for a user_id that doesn't exist — return a clean 422 instead of a 500
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({ error: 'Referenced record does not exist' })
  }

  const status = err.status || 500
  if (status >= 500) console.error(err)
  else console.warn(`[${status}] ${err.message}`)
  res.status(status).json({ error: err.message || 'Internal server error' })
}

module.exports = errorHandler
