'use strict';

const { SpotImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate ([
      {
        spotId: 1,
        url: "https://www.tfhmagazine.com/-/media/Project/OneWeb/TFH/US/articles/648_the_audubon_aquarium_of_the_americas.jpg?h=355&iar=0&w=755&hash=4A036D671CE607E1FA509FE087E4F649"
       ,preview: "true",
      },
      {
        spotId: 2,
        url: "https://ssl.cdn-redfin.com/photo/166/bigphoto/319/2238319_2.jpg"
       ,preview: "true",
      },
      {
        spotId: 3,
        url: "https://cdn.britannica.com/43/93843-050-A1F1B668/White-House-Washington-DC.jpg",
        preview: "true",
      },
      {
        spotId: 4,
        url: "https://www.nps.gov/common/uploads/grid_builder/thje/crop16_9/A8A9235B-1DD8-B71B-0BC0B5BD83666D32.jpg?width=640&quality=90&mode=crop",
        preview: "true",
      },
      {
        spotId: 5,
        url: "https://washington.org/sites/default/files/pixels.sh_visitors-to-the-lincoln-memorial-at-night_mydccool-via-crowdriff.jpg",
        preview: "true",
      },
      {
        spotId: 6,
        url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQLamzmVXTi32UUIAd0gbgOOoEEEsMPqVbUNmQwtq_SNkzIELqR38nAVZeE8MXXAL60bj927sfYR6s7zoW7osRZ6KqJhxK_ZtRzxUAJ3-unIogGEW1sQppzavNrJjTK1_Esw7MY_ti11Ky/s1600/battleship+1.jpg",
        preview: "true",
      },
      {
        spotId: 7,
        url: "https://www.cincinnati.com/gcdn/presto/2023/08/28/PMJS/0824ac25-3aef-476b-a883-7594470250c6-Bucees.PNG?crop=860,645,x107,y0",
        preview: "true",
      },
      {
        spotId: 8,
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrFolb08nliBZLgvjEuKmZD-nYogZVN1OWMw&s",
        preview: "true",
      },
      {
        spotId: 9,
        url: "https://blog.ticketmaster.com/wp-content/uploads/step-inside-caesars-superdome.png",
        preview: "true",
      },
      {
        spotId: 10,
        url: "https://www.tclf.org/sites/default/files/styles/full_width/public/thumbnails/image/AudubonZoo_feature_2016_KyleJacobson-PeterSummerlin_004.jpg?itok=MkfVffQu",
        preview: "true",
      },


    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkDelete(options, {}, {});
  }};

