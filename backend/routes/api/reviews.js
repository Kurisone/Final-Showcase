const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');

// Validation middleware for review data
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

// Get all reviews written by the current user
router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;

  const reviews = await Review.findAll({
    where: { userId: user.id },
    include: [
      { model: User, attributes: ['id', 'firstName', 'lastName'] },
      { model: Spot, attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'] },
      { model: ReviewImage, attributes: ['id', 'url'] },
    ],
  });

  // Add previewImage to each review's Spot
  for (let review of reviews) {
    const previewImage = await SpotImage.findOne({
      where: { spotId: review.Spot.id, preview: true },
      attributes: ['url'],
    });
    review.Spot.dataValues.previewImage = previewImage ? previewImage.url : null;
  }

  return res.json({ Reviews: reviews });
});

// Get all reviews for a specific spot
router.get('/spots/:spotId/reviews', async (req, res, next) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      { model: User, attributes: ['id', 'firstName', 'lastName'] },
      { model: ReviewImage, attributes: ['id', 'url'] },
    ],
  });

  return res.json({ Reviews: reviews });
});

// Create a review for a spot
router.post('/spots/:spotId/reviews', requireAuth, validateReview, async (req, res, next) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    return next(err);
  }

  const existingReview = await Review.findOne({ where: { spotId, userId: user.id } });
  if (existingReview) {
    const err = new Error('User already has a review for this spot');
    err.status = 403;
    return next(err);
  }

  const newReview = await Review.create({
    userId: user.id,
    spotId,
    review,
    stars,
  });

  return res.status(201).json(newReview);
});

// Update a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;

  const existingReview = await Review.findByPk(reviewId);
  if (!existingReview) {
    const err = new Error("Review couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (existingReview.userId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  existingReview.review = review;
  existingReview.stars = stars;
  await existingReview.save();

  return res.json(existingReview);
});

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
  const { reviewId } = req.params;
  const { user } = req;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    const err = new Error("Review couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (review.userId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  await review.destroy();
  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;