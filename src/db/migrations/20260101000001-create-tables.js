module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
    })

    await queryInterface.createTable('bookings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      reference_code: { type: Sequelize.STRING, allowNull: false, unique: true },
      travel_date: { type: Sequelize.DATEONLY, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
    })

    await queryInterface.createTable('booking_tickets', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
      },
      ticket_code: { type: Sequelize.STRING, allowNull: false, unique: true },
      used_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
    })

    await queryInterface.createTable('product_suppliers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      supplier_id: { type: Sequelize.INTEGER, allowNull: false },
      product_code: { type: Sequelize.STRING, allowNull: false },
      supplier_product_code: { type: Sequelize.STRING, allowNull: false },
    })

    await queryInterface.addConstraint('product_suppliers', {
      fields: ['supplier_id', 'supplier_product_code'],
      type: 'unique',
      name: 'uq_product_suppliers_supplier_product',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('booking_tickets')
    await queryInterface.dropTable('bookings')
    await queryInterface.dropTable('product_suppliers')
    await queryInterface.dropTable('users')
  },
}
