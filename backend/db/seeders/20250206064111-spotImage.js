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
        url: "https://www.google.com/local/place/fid/0x8620a66d391f6fb5:0x2160af1c86344b48/photosphere?iu=https://lh3.googleusercontent.com/p/AF1QipMxurDG1NaMdfVPipXcCf_V8nTZq6aRayAh19co%3Dw160-h106-k-no-pi-0-ya23.163603-ro-0-fo100&ik=CAoSLEFGMVFpcE14dXJERzFOYU1kZlZQaXBYY0NmX1Y4blRacTZhUmF5QWgxOWNv"
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
        url: "https://www.google.com/imgres?q=buc-ee%27s&imgurl=https%3A%2F%2Fwww.cincinnati.com%2Fgcdn%2Fpresto%2F2023%2F08%2F28%2FPMJS%2F0824ac25-3aef-476b-a883-7594470250c6-Bucees.PNG%3Fcrop%3D860%2C645%2Cx107%2Cy0&imgrefurl=https%3A%2F%2Fwww.cincinnati.com%2Fstory%2Fentertainment%2Fdining%2F2024%2F08%2F27%2Fbuc-ees-popularity-explained%2F73417471007%2F&docid=XvCG2rbTnfbyDM&tbnid=PHxEABNRaBYCOM&vet=12ahUKEwiF2ffL3LiLAxXlSTABHdwUAlsQM3oFCIEBEAA..i&w=860&h=645&hcb=2&ved=2ahUKEwiF2ffL3LiLAxXlSTABHdwUAlsQM3oFCIEBEAA",
        preview: "true",
      },
      {
        spotId: 8,
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrFolb08nliBZLgvjEuKmZD-nYogZVN1OWMw&s",
        preview: "true",
      },
      {
        spotId: 9,
        url: "https://www.google.com/imgres?q=caesars%20superdome&imgurl=https%3A%2F%2Fblog.ticketmaster.com%2Fwp-content%2Fuploads%2Fstep-inside-caesars-superdome.png&imgrefurl=https%3A%2F%2Fblog.ticketmaster.com%2Fstep-inside-caesars-superdome-new-orleans-la%2F&docid=X-MuUq2uas230M&tbnid=t4CNgZIINT6cNM&vet=12ahUKEwjmof2F3biLAxXWTjABHQLLCrIQM3oECBwQAA..i&w=1024&h=576&hcb=2&ved=2ahUKEwjmof2F3biLAxXWTjABHQLLCrIQM3oECBwQAA",
        preview: "true",
      },
      {
        spotId: 10,
        url: "https://www.google.com/imgres?q=audubon%20zoo&imgurl=https%3A%2F%2Fwww.tclf.org%2Fsites%2Fdefault%2Ffiles%2Fstyles%2Ffull_width%2Fpublic%2Fthumbnails%2Fimage%2FAudubonZoo_feature_2016_KyleJacobson-PeterSummerlin_004.jpg%3Fitok%3DMkfVffQu&imgrefurl=https%3A%2F%2Fwww.tclf.org%2Flandscapes%2Faudubon-zoo&docid=fdKdZAVLZkaCuM&tbnid=32wXIfK_Qr15TM&vet=12ahUKEwj2hq-b3biLAxVyjLAFHQtGC58QM3oECGQQAA..i&w=1200&h=675&hcb=2&ved=2ahUKEwj2hq-b3biLAxVyjLAFHQtGC58QM3oECGQQAA",
        preview: "true",
      },


    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkDelete(options, {}, {});
  }};

