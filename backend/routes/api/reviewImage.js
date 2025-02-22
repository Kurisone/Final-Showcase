const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Review, ReviewImage } = require('../../db/models');

// Add an image to a review
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
  const { reviewId } = req.params;
  const { url } = req.body;
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

  const imageCount = await ReviewImage.count({ where: { reviewId } });
  if (imageCount >= 10) {
    const err = new Error('Maximum number of images for this resource was reached');
    err.status = 403;
    return next(err);
  }

  const newImage = await ReviewImage.create({ reviewId, url });
  return res.status(201).json(newImage);
});

// Delete a review image
router.delete('/review-images/:imageId', requireAuth, async (req, res, next) => {
  const { imageId } = req.params;
  const { user } = req;

  const reviewImage = await ReviewImage.findByPk(imageId, {
    include: { model: Review, attributes: ['userId'] },
  });

  if (!reviewImage) {
    const err = new Error("Review Image couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (reviewImage.Review.userId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  await reviewImage.destroy();
  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;