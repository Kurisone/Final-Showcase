'use strict';
const { 
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User,{
        foreignKey:"ownerId",
      });
       Spot.hasMany(models.Review, {
       foreignKey: "spotId"
       });
       Spot.hasMany(models.Booking, {
         foreignKey: "spotId"
       });
       Spot.hasMany(models.SpotImage, {
         foreignKey: "spotId"
       });
  }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      references:{
        model:"User"
      },onDelete:"CASCADE"
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: false,
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
        unique: true,
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
        unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
        unique: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
        unique: false,
    },
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};