'use strict';
let options = {}
if(process.env.NODE_ENV === 'production'){
  options.schema = process.env.SCHEMA
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Reviews", "numReviews",{
        type: Sequelize.FLOAT,
        allowNull:true,
      
    },options)
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Reviews";
    await queryInterface.removeColumn(options, "numReviews", {}
    );
  }
};

