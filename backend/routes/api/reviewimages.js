const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { ReviewImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const { Review } = require('../../db/models')


//deleting a review image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    try {
    const imageId = parseInt(req.params.imageId);
    const theImage = await ReviewImage.findByPk(imageId, {
        include: {model: Review},
    });
    if(!theImage) {
        return res.status(404).json({
            message: "Review Image couldn't be found",
        });
    }
    await theImage.destroy();
    return res.json({
        message: "Successfully deleted",
    });
} catch(err){
    next(err)
}
});

module.exports = router;