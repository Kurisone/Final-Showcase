const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, Booking, User, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require("sequelize")
const router = express.Router();



const validateBooking =  [
  check('startDate')
    .exists({ checkFalsy: true })
    .withMessage('Start date is required')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  check('endDate')
    .exists({ checkFalsy: true })
    .withMessage('End date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      } 
      
      return true;
    }),
 handleValidationErrors
];

// Middleware to check for booking conflicts

const checkBookingConflicts = async (req, res, next) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const conflictingBookings = await Booking.findAll({
    where: {
      spotId,
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  next();
};

 //Add Query Filters to get all Spots + GET ALL SPOTS
 router.get('/', async (req, res, next) => {
  const { 
    minLat,
    maxLat,
    minLng,
    maxLng,
    minPrice,
    maxPrice,
  } = req.query;
let {page=1,size=10}=req.query;
  const where = {};
  // Add filters based on query parameters
  if(page<1) page = 1;
  if(page >10) page = 10;
  if(size >20) size = 20; 
  if(size <10) size = 10;
  if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
  if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
  if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
  if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
  if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

  try { 
    const spots = await Spot.findAll({
      where,
      limit: size,
      offset: (page - 1) * size,
    });
    return res.json({ 'Spots':spots})


  } catch (err) {
    console.log(err);
    next(err); 
  }
});
// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res, next) => {
  const { user } = req;
  try {
    const spots = await Spot.findAll({
      where: { ownerId: user.id }
    });
    return res.json({ 'Spots': spots });
  } catch (err) {
    next(err)
  }
});

// Get details of a Spot from an id
router.get('/:spotId', async (req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  try {
    const spot = await Spot.findByPk(spotId, {
      include: [SpotImage, User]
    
    });
    if(!spot){
      res.status(404).json({ 'message': "Spot couldn't be found" });
    }
     res.json({'Spot': spot});
  } catch (err) {
  console.log(err)
  }
});

// Create a Spot
router.post('/', requireAuth, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  // Validation Errors
  const errors = {};
  if (!address) errors.address = "Street address is required";
  if (!city) errors.city = "City is required";
  if (!state) errors.state = "State is required";
  if (!country) errors.country = "Country is required";
  if (lat === undefined || lat < -90 || lat > 90) errors.lat = "Latitude must be within -90 and 90";
  if (lng === undefined || lng < -180 || lng > 180) errors.lng = "Longitude must be within -180 and 180";
  if (!name || name.length > 50) errors.name = "Name must be less than 50 characters";
  if (!description) errors.description = "Description is required";
  if (price === undefined || price <= 0) errors.price = "Price per day must be a positive number";

  // If any errors exist, return a 400 response
  if (Object.keys(errors).length > 0) {
      return res.status(400).json({
          message: "Bad Request",
          errors,
      });
  }

  try {
      const newSpot = await Spot.create({
          ownerId: req.user.id,
          address,
          city,
          state,
          country,
          lat,
          lng,
          name,
          description,
          price
      });

      return res.status(201).json(newSpot);
  } catch (err) {
      next(err);
  }
});


//EDIT A SPOT
router.put('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // Check if the current user is the owner of the spot
      if (spot.ownerId !== user.id) {
          return res.status(403).json({ message: 'Forbidden' });
      }

      // Validate input fields
      const errors = {};
      if (!address) errors.address = "Street address is required";
      if (!city) errors.city = "City is required";
      if (!state) errors.state = "State is required";
      if (!country) errors.country = "Country is required";
      if (lat === undefined || lat < -90 || lat > 90) errors.lat = "Latitude must be within -90 and 90";
      if (lng === undefined || lng < -180 || lng > 180) errors.lng = "Longitude must be within -180 and 180";
      if (!name || name.length > 50) errors.name = "Name must be less than 50 characters";
      if (!description) errors.description = "Description is required";
      if (price === undefined || price <= 0) errors.price = "Price per day must be a positive number";

      // If any errors exist, return a 400 response
      if (Object.keys(errors).length > 0) {
          return res.status(400).json({
              message: "Bad Request",
              errors,
          });
      }
  
      // Update the spot
      spot.address = address || spot.address;
      spot.city = city || spot.city;
      spot.state = state || spot.state;
      spot.country = country || spot.country;
      spot.lat = lat || spot.lat;
      spot.lng = lng || spot.lng;
      spot.name = name || spot.name;
      spot.description = description || spot.description;
      spot.price = price || spot.price;
  
      await spot.save();
      return res.json(spot);
    } catch (err) {
     next(err)}
  });
  
  // Delete a Spot
  router.delete('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { user } = req;
  
    try {
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return  res.status(404).json({ 'message': "Spot couldn't be found" });
      }
  
      // Check if the current user is the owner of the spot
      if (spot.ownerId !== user.id) {
        return  res.status(403).json({ 'message': 'Forbidden' });
      }
  
      await spot.destroy();
      return res.json({ 'message': 'Successfully deleted' });
    } catch (err) {
      next(err)
    }
  });

//creating a spot image
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    const spotId = parseInt(req.params.spotId)
    const { url, preview } = req.body;
    const theSpot = await Spot.findByPk(spotId);
    if(!theSpot) {
        return res.json({
            message: "Spot couldn't be found",
        });
    }
    if(theSpot.ownerId === req.user.id ){
    const newSpotImage = await SpotImage.create({
       url, preview, spotId
    });
    return res.json({newSpotImage})
  };
});

//Get all reviews by a spots id
router.get('/:spotId/reviews', async(req, res) => {
    const spotId = parseInt(req.params.spotId);


   const spot = await Spot.findByPk(spotId);

   if(!spot){
     res.status(404).json({message: "Spot couldn't be found"});
   }
   
   const reviews= await Review.findAll({
    where: {spotId: spotId},
    include: [User, ReviewImage]
   });

    res.json({"Reviews": reviews});

});

// Get all Bookings for a spot based on the Spot's Id
router.get('/:spotId/bookings', requireAuth, async (req,res, next) => {
  const spotId = parseInt(req.params.spotId);
  const { user } = req;
  
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      res.status(404).json({message: "Spot couldn't be found"})
    }
  
    if(spot.dataValues.ownerId === user.id) {
      const booking = await Booking.findAll({where:{spotId}, model:{User}})
      res.status(200).json({ 
        "Bookings": booking,
      })
    } else{
      const booking = await Booking.findAll({where:{spotId}})
      res.status(200).json({
        "Bookings":booking,

      })
    }

});
// Create a new booking at a spot based on the spotId

router.post('/:spotId/bookings', requireAuth, validateBooking, checkBookingConflicts, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const newBooking = await Booking.create({
    spotId,
    userId: id,
    startDate,
    endDate,
  });

  res.status(200).json(newBooking);
});
//create a review for a spot based on the spots id 
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const spotId = parseInt(req.params.spotId);
    const {
        review,
        stars
    } = req.body;
    try {
        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({message: 'That spot does not exist'})
        }
        const newReview = await Review.create({
            userId,
            spotId,
            review,
            stars
        });
        return res.status(201).json(newReview);
    } catch (err) {
        return res.status(400).json({message: 'Bad Request'})
    }
});

module.exports = router;
















