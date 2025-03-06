'use strict';

const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
        {
          ownerId: 1,
          address: "1 Canal St",
          city: "New Orleans",
          state: "Louisiana",
          country: "United States of America",
          lat: 29.9429,
          lng: -90.0651,
          name: "Audubon Aquarium Luxury Suite",
          description: "Stay overnight in a luxurious suite overlooking the Audubon Aquarium of the Americas. Enjoy private access to the aquarium after hours and stunning views of the Mississippi River. Perfect for families or couples seeking a unique experience.",
          price: 450.00
        },
        {
          ownerId: 2,
          address: "42273 Southern Pines Blvd",
          city: "Ponchatoula",
          state: "Louisiana",
          country: "United States of America",
          lat: 30.4385,
          lng: -90.4412,
          name: "Countryside Retreat",
          description: "A charming countryside home near Ponchatoula, surrounded by nature. Features a spacious porch, modern amenities, and easy access to local attractions. Ideal for a peaceful getaway.",
          price: 120.00
        },
        {
          ownerId: 3,
          address: "1600 Pennsylvania Avenue NW",
          city: "Washington",
          state: "DC",
          country: "United States of America",
          lat: 38.8977,
          lng: -77.0365,
          name: "The White House Experience",
          description: "An exclusive opportunity to stay in a historic property near the White House. Enjoy luxurious accommodations, guided tours, and a taste of presidential history.",
          price: 2000.00
        },
        {
          ownerId: 4,
          address: "900 Ohio Drive SW",
          city: "Washington",
          state: "DC",
          country: "United States of America",
          lat: 38.8813,
          lng: -77.0365,
          name: "Jefferson Memorial View Apartment",
          description: "A modern apartment with breathtaking views of the Jefferson Memorial and Tidal Basin. Perfect for history enthusiasts and those looking to explore Washington, DC.",
          price: 300.00
        },
        {
          ownerId: 5,
          address: "2 Lincoln Memorial Circle NW",
          city: "Washington",
          state: "DC",
          country: "United States of America",
          lat: 38.8893,
          lng: -77.0502,
          name: "Lincoln Memorial Loft",
          description: "A stylish loft steps away from the Lincoln Memorial. Features contemporary design, high-end amenities, and easy access to DC's top attractions.",
          price: 350.00
        },
        {
          ownerId: 6,
          address: "2703 Battleship Parkway",
          city: "Mobile",
          state: "Alabama",
          country: "United States of America",
          lat: 30.6818,
          lng: -88.0144,
          name: "USS Alabama Stay",
          description: "Stay aboard a historic naval vessel near the USS Alabama Battleship Memorial Park. A unique experience for history buffs and families, with guided tours included.",
          price: 250.00
        },
        {
          ownerId: 7,
          address: "20403 AL-59",
          city: "Robertsdale",
          state: "Alabama",
          country: "United States of America",
          lat: 30.5538,
          lng: -87.7116,
          name: "Buc-ee's Roadside Cabin",
          description: "A cozy cabin located near the famous Buc-ee's travel center. Perfect for road trippers looking for a comfortable and convenient place to rest.",
          price: 90.00
        },
        {
          ownerId: 8,
          address: "615 Pere Antoine Alley",
          city: "New Orleans",
          state: "Louisiana",
          country: "United States of America",
          lat: 29.9574,
          lng: -90.0634,
          name: "St. Louis Cathedral Guesthouse",
          description: "A historic guesthouse located steps away from the iconic St. Louis Cathedral. Offers elegant rooms, Southern hospitality, and easy access to the French Quarter.",
          price: 180.00
        },
        {
          ownerId: 9,
          address: "1500 Sugar Bowl Drive",
          city: "New Orleans",
          state: "Louisiana",
          country: "United States of America",
          lat: 29.9508,
          lng: -90.0756,
          name: "Superdome Skyline Suite",
          description: "A luxurious suite with panoramic views of the Caesars Superdome and New Orleans skyline. Perfect for sports fans and event-goers.",
          price: 400.00
        },
        {
          ownerId: 10,
          address: "6500 Magazine Street",
          city: "New Orleans",
          state: "Louisiana",
          country: "United States of America",
          lat: 29.9231,
          lng: -90.1286,
          name: "Audubon Zoo Cottage",
          description: "A charming cottage located near the Audubon Zoo. Features a private garden, modern amenities, and easy access to the zoo and other attractions.",
          price: 150.00
        }

    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkDelete(options, {}, {});
  }};
