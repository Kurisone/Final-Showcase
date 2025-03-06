'use strict';

const { Review } = require('../models');


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate ([
        {
          spotId: 1,
          userId: 1,
          review: "The Audubon Aquarium Luxury Suite was an unforgettable experience! Waking up to the view of the Mississippi River and having private access to the aquarium at night was magical. Perfect for families and couples alike.",
          stars: 5,
        },
        {
          spotId: 2,
          userId: 2,
          review: "The Countryside Retreat was exactly what we needed for a peaceful getaway. The home is surrounded by nature, and the porch was perfect for morning coffee. Highly recommend for anyone looking to relax.",
          stars: 4,
        },
        {
          spotId: 3,
          userId: 3,
          review: "Staying near the White House was a unique experience, but the property felt a bit overpriced for what it offered. The guided tours were interesting, but the accommodations were just average.",
          stars: 2,
        },
        {
          spotId: 4,
          userId: 4,
          review: "The Jefferson Memorial View Apartment had stunning views of the Tidal Basin, and the location was perfect for exploring DC. The apartment itself was modern and comfortable, though a bit small.",
          stars: 3,
        },
        {
          spotId: 5,
          userId: 5,
          review: "The Lincoln Memorial Loft was stylish and well-located, but the noise from the street was a bit distracting. The proximity to the memorials was a big plus, though.",
          stars: 2,
        },
        {
          spotId: 6,
          userId: 6,
          review: "Staying aboard the USS Alabama was a dream come true for my kids! They loved exploring the battleship, and the guided tours were very informative. A unique and memorable experience for the whole family.",
          stars: 5,
        },
        {
          spotId: 7,
          userId: 7,
          review: "The Buc-ee's Roadside Cabin was cozy and convenient for our road trip. The kids loved visiting Buc-ee's, and the cabin had everything we needed for a comfortable stay.",
          stars: 4,
        },
        {
          spotId: 8,
          userId: 8,
          review: "The St. Louis Cathedral Guesthouse was charming and full of history, but the surrounding area felt a bit unsafe at night. The room itself was elegant and comfortable, though.",
          stars: 3,
        },
        {
          spotId: 9,
          userId: 9,
          review: "The Superdome Skyline Suite was disappointing. The room was overpriced, and it wasn’t as clean as we expected. The view of the Superdome was nice, but that’s about it.",
          stars: 1,
        },
        {
          spotId: 10,
          userId: 10,
          review: "The Audubon Zoo Cottage was perfect for our family trip! The kids loved being so close to the zoo, and the private garden was a great place to relax. We’ll definitely be back!",
          stars: 4,
        },

    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, {}, {});
  }};
