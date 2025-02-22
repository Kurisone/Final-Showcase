const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Spot, SpotImage } = require('../../db/models');

// Create spot image
router.post('/spots/:spotId/images', requireAuth, async (req, res, next) => {
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

  const newImage = await SpotImage.create({ spotId, url, preview });
  return res.status(201).json(newImage);
});

// Delete image
router.delete('/spot-images/:imageId', requireAuth, async (req, res, next) => {
  const { imageId } = req.params;
  const { user } = req;

  const spotImage = await SpotImage.findByPk(imageId, {
    include: { model: Spot, attributes: ['ownerId'] },
  });

  if (!spotImage) {
    const err = new Error("Spot Image couldn't be found");
    err.status = 404;
    return next(err);
  }

  if (spotImage.Spot.ownerId !== user.id) {
    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
  }

  await spotImage.destroy();
  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;