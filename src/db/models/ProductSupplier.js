const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const ProductSupplier = sequelize.define(
    'ProductSupplier',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplier_product_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'product_suppliers',
    }
  )

  return ProductSupplier
}
