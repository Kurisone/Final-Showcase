'use strict';

const { Booking } = require('../models');

let options= {};
if (process.env.NODE_ENV === 'production'){
  options.schema = process.env.SCHEMA
}
module.exports = {
  async up (queryInterface, Sequelize) {
   await Booking.bulkCreate([
    {
      spotId: 1,
      userId: 1,
      startDate: new Date(),
      endDate: "2025-02-15T08:12:00.000Z"
    },
    {
      spotId: 2,
      userId: 2,
      startDate: "2025-02-14T08:12:00.000Z",
      endDate: "2025-02-20T08:12:00.000Z"
    },
    {
      spotId: 3,
      userId: 3,
      startDate: "2025-02-13T08:12:00.000Z",
      endDate: "2025-02-28T08:12:00.000Z"
    },{
      spotId: 4,
      userId: 4,
      startDate: "2025-02-15T08:12:00.000Z",
      endDate: "2025-02-17T08:12:00.000Z"
    },{
      spotId: 5,
      userId: 5,
      startDate: "2025-02-16T08:12:00.000Z",
      endDate: "2025-02-17T08:12:00.000Z"
    },{
      spotId: 6,
      userId: 6,
      startDate: "2025-02-18T08:12:00.000Z",
      endDate: "2025-02-19T08:12:00.000Z"
    },{
      spotId: 7,
      userId: 7,
      startDate: "2025-02-20T08:12:00.000Z",
      endDate: "2025-02-21T08:12:00.000Z"
    },{
      spotId: 8,
      userId: 8,
      startDate: "2025-02-23T08:12:00.000Z",
      endDate: "2025-02-25T08:12:00.000Z"
    },{
      spotId: 9,
      userId: 9,
      startDate: "2025-02-24T08:12:00.000Z",
      endDate: "2025-02-26T08:12:00.000Z"
    },
    {
      spotId: 10,
      userId: 10,
      startDate: "2025-02-25T08:12:00.000Z",
      endDate: "2025-02-27T08:12:00.000Z"
    },

   ])
  },

  async down (queryInterface, Sequelize) {
   options.tableName = 'Bookings';
   return queryInterface.bulkDelete(options, {}, {})
  }
};
