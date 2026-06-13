module.exports = {
  up: async (queryInterface) => {
    const [users] = await queryInterface.sequelize.query('SELECT COUNT(*) FROM users')
    if (Number(users[0].count) === 0) {
      await queryInterface.bulkInsert('users', [
        { email: 'alice@example.com' },
        { email: 'bob@example.com' },
      ])
    }

    const [suppliers] = await queryInterface.sequelize.query('SELECT COUNT(*) FROM product_suppliers')
    if (Number(suppliers[0].count) === 0) {
      await queryInterface.bulkInsert('product_suppliers', [
        {
          supplier_id: 1,
          product_code: 'product-1',
          supplier_product_code: 'PROD-EXT-001',
        },
        {
          supplier_id: 1,
          product_code: 'product-2',
          supplier_product_code: 'PROD-EXT-002',
        },
      ])
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('product_suppliers', null, {})
    await queryInterface.bulkDelete('users', null, {})
  },
}
