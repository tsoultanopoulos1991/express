const { ProductSupplier } = require('../db')
const { getAvailability } = require('../services/availabilityService')
const { AppError } = require('../errors')
const asyncHandler = require('../utils/asyncHandler')

const index = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const exists = await ProductSupplier.findOne({ where: { product_code: productId } })
  if (!exists) throw new AppError('Product not found', 404)

  const data = await getAvailability(productId)
  res.status(200).json(data)
})

module.exports = { index }
