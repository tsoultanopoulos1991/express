const { getAvailability } = require('../services/availabilityService')
const asyncHandler = require('../utils/asyncHandler')

const index = asyncHandler(async (req, res) => {
  const data = await getAvailability(req.params.productId)
  res.status(200).json(data)
})

module.exports = { index }
