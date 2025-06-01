const express = require('express');
const { Review, ReviewImage, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateReview = [
  check("review")
    .notEmpty()
    .withMessage("Review text is required"),
  check("stars")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Stars must be a number from 1 to 5"),
  handleValidationErrors,
];

// Create a review image
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const imageCount = await ReviewImage.count({ where: { reviewId } });
    if (imageCount >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this review was reached" });
    }

    const newImage = await ReviewImage.create({ url, reviewId });
    return res.json({ id: newImage.id, url: newImage.url });
  } catch (err) {
    return res.status(400).json({ message: "Bad Request" });
  }
});

// Get all reviews of the current user with decimal ratings
router.get('/current', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: parseFloat(review.stars).toFixed(1),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      User: review.User,
      ReviewImages: review.ReviewImages
    }));

    return res.json({ Reviews: formattedReviews });
  } catch (err) {
    return res.status(400).json({ message: "Bad Request" });
  }
});

// Edit a review (now accepts decimal ratings)
router.put("/:reviewId", requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    return res.json(existingReview);
  } catch (err) {
    return res.status(400).json({ message: "Bad Request" });
  }
});

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await review.destroy();
    return res.json({ message: "Successfully deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Bad Request" });
  }
});

module.exports = router;