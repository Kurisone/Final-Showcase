// routes/spots.js
const express = require('express');
const router = express.Router();
const { Spot, SpotImage, Review, User } = require('../models');
const { requireAuth } = require('../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

const validateSpot = [
  check('address').exists().withMessage('Street address is required'),
  check('city').exists().withMessage('City is required'),
  check('state').exists().withMessage('State is required'),
  check('country').exists().withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').exists().withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  handleValidationErrors,
];

// GET /api/spots (Get All Spots)
router.get('/', async (req, res) => {
  const spots = await Spot.findAll({
    include: [
      { model: SpotImage, where: { preview: true }, required: false, attributes: ['url'] },
      { model: Review, attributes: ['stars'] },
    ],
  });

  const response = spots.map(spot => {
    const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
    const avgRating = spot.Reviews.length ? totalStars / spot.Reviews.length : 0;

    return {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      avgRating,
      previewImage: spot.SpotImages[0]?.url || null,
    };
  });

  return res.json({ Spots: response });
});

// GET /api/spots/current (Get Spots Owned by Current User)
router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;

  const spots = await Spot.findAll({
    where: { ownerId: user.id },
    include: [
      { model: SpotImage, where: { preview: true }, required: false, attributes: ['url'] },
      { model: Review, attributes: ['stars'] },
    ],
  });

  const response = spots.map(spot => {
    const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
    const avgRating = spot.Reviews.length ? totalStars / spot.Reviews.length : 0;

    return {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      avgRating,
      previewImage: spot.SpotImages[0]?.url || null,
    };
  });

  return res.json({ Spots: response });
});

// GET /api/spots/:spotId (Get Details of a Spot by ID)
router.get('/:spotId', async (req, res, next) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId, {
    include: [
      { model: SpotImage, attributes: ['id', 'url', 'preview'] },
      { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] },
      { model: Review, attributes: ['stars'] },
    ],
  });

  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
  const avgRating = spot.Reviews.length ? totalStars / spot.Reviews.length : 0;

  const response = {
    id: spot.id,
    ownerId: spot.ownerId,
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    numReviews: spot.Reviews.length,
    avgStarRating: avgRating,
    SpotImages: spot.SpotImages,
    Owner: spot.Owner,
  };

  return res.json(response);
});

// POST /api/spots (Create a Spot)
router.post('/', requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req;

  const spot = await Spot.create({
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.status(201).json(spot);
});

// POST /api/spots/:spotId/images (Add an Image to a Spot)
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const { user } = req;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (spot.ownerId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  const image = await SpotImage.create({
    spotId,
    url,
    preview,
  });

  return res.json({
    id: image.id,
    url: image.url,
    preview: image.preview,
  });
});

// PUT /api/spots/:spotId (Update a Spot)
router.put('/:spotId', requireAuth, validateSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (spot.ownerId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  spot.address = address;
  spot.city = city;
  spot.state = state;
  spot.country = country;
  spot.lat = lat;
  spot.lng = lng;
  spot.name = name;
  spot.description = description;
  spot.price = price;
  await spot.save();

  return res.json(spot);
});

// DELETE /api/spots/:spotId (Delete a Spot)
router.delete('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (spot.ownerId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  await spot.destroy();

  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;