const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, Booking, User, ReviewImage, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require("sequelize");
const router = express.Router();

const validateBooking = [
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

// GET all spots with filters
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
      include: [
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]
        ]
      },
      group: ['Spot.id']
    });

    const formattedSpots = spots.map(spot => {
      const spotData = spot.toJSON();
      return {
        id: spotData.id,
        ownerId: spotData.ownerId,
        address: spotData.address,
        city: spotData.city,
        state: spotData.state,
        country: spotData.country,
        lat: spotData.lat,
        lng: spotData.lng,
        name: spotData.name,
        description: spotData.description,
        price: spotData.price,
        createdAt: spotData.createdAt,
        updatedAt: spotData.updatedAt,
        avgRating: spotData.avgRating ? Number(spotData.avgRating).toFixed(1) : null,
        previewImage: spotData.SpotImages?.[0]?.url || null
      };
    });

    return res.json({ Spots: formattedSpots });
  } catch (err) {
    console.log(err);
    next(err); 
  }
});

// GET all spots owned by current user
router.get('/current', requireAuth, async (req, res, next) => {
  const { user } = req;
  try {
    const spots = await Spot.findAll({
      where: { ownerId: user.id },
      include: [
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]
        ]
      },
      group: ['Spot.id']
    });

    const formattedSpots = spots.map(spot => {
      const spotData = spot.toJSON();
      return {
        id: spotData.id,
        ownerId: spotData.ownerId,
        address: spotData.address,
        city: spotData.city,
        state: spotData.state,
        country: spotData.country,
        lat: spotData.lat,
        lng: spotData.lng,
        name: spotData.name,
        description: spotData.description,
        price: spotData.price,
        createdAt: spotData.createdAt,
        updatedAt: spotData.updatedAt,
        avgRating: spotData.avgRating ? Number(spotData.avgRating).toFixed(1) : null,
        previewImage: spotData.SpotImages?.[0]?.url || null
      };
    });

    return res.json({ Spots: formattedSpots });
  } catch (err) {
    next(err);
  }
});

// GET spot details by ID
router.get('/:spotId', async (req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'preview']
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    if(!spot){
      return res.status(404).json({ 'message': "Spot couldn't be found" });
    }

    // Calculate average rating and number of reviews
    const reviews = await Review.findAll({
      where: { spotId },
      attributes: ['stars']
    });

    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    const avgRating = reviews.length ? (totalStars / reviews.length).toFixed(1) : null;
    const numReviews = reviews.length;

    const spotData = spot.toJSON();
    spotData.numReviews = numReviews;
    spotData.avgStarRating = avgRating;

    // Add previewImage field if any preview image exists
    const previewImage = spotData.SpotImages.find(img => img.preview);
    spotData.previewImage = previewImage ? previewImage.url : null;

    return res.json({ Spot: spotData });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// POST create a new spot
router.post('/', requireAuth, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

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

// PUT edit a spot
router.put('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

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

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }
  
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
    next(err);
  }
});

// DELETE a spot
router.delete('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ 'message': "Spot couldn't be found" });
    }

    if (spot.ownerId !== user.id) {
      return res.status(403).json({ 'message': 'Forbidden' });
    }

    await spot.destroy();
    return res.json({ 'message': 'Successfully deleted' });
  } catch (err) {
    next(err);
  }
});

// POST add an image to a spot
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  const { url, preview } = req.body;
  const theSpot = await Spot.findByPk(spotId);
  
  if(!theSpot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  
  if(theSpot.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const newSpotImage = await SpotImage.create({
    url, 
    preview, 
    spotId
  });
  
  return res.json({
    id: newSpotImage.id,
    url: newSpotImage.url,
    preview: newSpotImage.preview
  });
});

// GET all reviews for a spot
router.get('/:spotId/reviews', async(req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  try {
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      return res.status(404).json({message: "Spot couldn't be found"});
    }
    
    const reviews = await Review.findAll({
      where: {spotId},
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ]
    });

    return res.json({"Reviews": reviews});
  } catch (err) {
    next(err);
  }
});

// GET all bookings for a spot
router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  const { user } = req;
  
  try {
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      return res.status(404).json({message: "Spot couldn't be found"});
    }
  
    if(spot.ownerId === user.id) {
      const bookings = await Booking.findAll({
        where: {spotId},
        include: {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      });
      return res.json({ Bookings: bookings });
    } else {
      const bookings = await Booking.findAll({
        where: {spotId},
        attributes: ['spotId', 'startDate', 'endDate']
      });
      return res.json({ Bookings: bookings });
    }
  } catch (err) {
    next(err);
  }
});

// POST create a booking for a spot
router.post('/:spotId/bookings', requireAuth, validateBooking, checkBookingConflicts, async (req, res, next) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId === id) {
      return res.status(403).json({ message: "Cannot book your own spot" });
    }

    const newBooking = await Booking.create({
      spotId,
      userId: id,
      startDate,
      endDate,
    });

    return res.status(200).json(newBooking);
  } catch (err) {
    next(err);
  }
});

// POST create a review for a spot
router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
  const userId = req.user.id;
  const spotId = parseInt(req.params.spotId);
  const { review, stars } = req.body;

  try {
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      return res.status(404).json({message: "Spot couldn't be found"});
    }

    const existingReview = await Review.findOne({
      where: {
        userId,
        spotId
      }
    });

    if (existingReview) {
      return res.status(500).json({message: "User already has a review for this spot"});
    }

    if (!review || stars < 1 || stars > 5) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          review: "Review text is required",
          stars: "Stars must be an integer from 1 to 5"
        }
      });
    }

    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars
    });

    return res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;