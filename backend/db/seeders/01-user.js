'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: 'Jared',
        lastName: 'Jerry',
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Bert',
        lastName: 'Kreischer',
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        firstName: 'Tom',
        lastName: 'Segura',
        email: 'AB@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        firstName: 'Dana',
        lastName: 'White',
        email: 'user3@user.io',
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password4')
    },
    {
        firstName: 'Joey',
        lastName: 'Diaz',
        email: 'user4@user.io',
        username: 'FakeUser4',
        hashedPassword: bcrypt.hashSync('password5')
    },
    {
        firstName: 'Joe',
        lastName: 'Rogan',
        email: 'user5@user.io',
        username: 'FakeUser5',
        hashedPassword: bcrypt.hashSync('password6')
    },
    {
        firstName: 'Ron',
        lastName: 'White',
        email: 'user6@user.io',
        username: 'FakeUser6',
        hashedPassword: bcrypt.hashSync('password7')
    },
    {
        firstName: 'Woody',
        lastName: 'Harrelson',
        email: 'user7@user.io',
        username: 'FakeUser7',
        hashedPassword: bcrypt.hashSync('password8')
    },{
        firstName: 'Katt',
        lastName: 'Williams',
        email: 'user8@user.io',
        username: 'FakeUser8',
        hashedPassword: bcrypt.hashSync('password9')
    },{
        firstName: 'Dave',
        lastName: 'Chapelle',
        email: 'user9@user.io',
        username: 'FakeUser9',
        hashedPassword: bcrypt.hashSync('password10')
    },

    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users'
    return queryInterface.bulkDelete(options, {},{});
}};
