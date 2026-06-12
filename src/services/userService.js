const { User } = require('../db')
const { AppError } = require('../errors')

const getUsers = async () => {
  return User.findAll()
}

const getUserById = async (id) => {
  const user = await User.findByPk(id)
  if (!user) throw new AppError('User not found', 404)
  return user
}

const createUser = async ({ email }) => {
  const existing = await User.findOne({ where: { email } })
  if (existing) throw new AppError('Email already in use', 409)
  return User.create({ email })
}

module.exports = { getUsers, getUserById, createUser }
