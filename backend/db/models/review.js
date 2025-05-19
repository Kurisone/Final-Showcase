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
  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'spotId cannot be null'
        },
        isInt: {
          msg: 'spotId must be an integer'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'userId cannot be null'
        },
        isInt: {
          msg: 'userId must be an integer'
        }
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Review text cannot be empty'
        },
        notEmpty: {
          msg: 'Review text cannot be empty'
        }
      }
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Stars cannot be null'
        },
        isInt: {
          msg: 'Stars must be an integer'
        },
        min: {
          args: [1],
          msg: 'Stars must be between 1 and 5'
        },
        max: {
          args: [5],
          msg: 'Stars must be between 1 and 5'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
