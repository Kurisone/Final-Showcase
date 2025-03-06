'use strict';
let options = {}
if(process.env.NODE_ENV === 'production'){
  options.schema = process.env.SCHEMA
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Spots", "avgStarRating",{
        type: Sequelize.FLOAT,
        allowNull:true,
      
    },options)
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.removeColumn(options, "avgStarRating", {}
    );
  }
};
