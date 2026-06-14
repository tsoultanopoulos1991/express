const { getUsers, createUser } = require('../services/userService')
const asyncHandler = require('../utils/asyncHandler')

const index = asyncHandler(async (req, res) => {
  const users = await getUsers()
  res.status(200).json(users)
})

const create = asyncHandler(async (req, res) => {
  const user = await createUser({ email: req.body.email })
  console.info(`[users] created user id=${user.id}`)
  res.status(201).json(user)
})

module.exports = { index, create }
