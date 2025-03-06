"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // define association here
      Review.belongsTo(models.Spot, {
        foreignKey: "spotId",
      });
      Review.hasMany(models.ReviewImage, {
        foreignKey: "reviewId"
      });
      Review.belongsTo(models.User, {
        foreignKey: "userId"
      });
    };
  };
  Review.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Spots'
       }, 
       onDelete:"CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users'
        },
        onDelete: "CASCADE",
      },
      review: {
        type: DataTypes.STRING,
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
