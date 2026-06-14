const { ProductSupplier } = require('../db')
const asyncHandler = require('../utils/asyncHandler')

const list = asyncHandler(async (req, res) => {
  const products = await ProductSupplier.findAll()
  res.status(200).json(products)
})

module.exports = { list }
