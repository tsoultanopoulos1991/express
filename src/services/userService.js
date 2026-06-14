const { User } = require('../db')
const { AppError } = require('../errors')

const getUsers = async () => {
  return User.findAll()
}

const createUser = async ({ email }) => {
  const existing = await User.findOne({ where: { email } })
  if (existing) throw new AppError('Email already in use', 409)
  return User.create({ email })
}

module.exports = { getUsers, createUser }
