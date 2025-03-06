const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review, ReviewImage } = require ('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


const validateReview = [
    check("review")
        .notEmpty()
        .withMessage("Review text is required"),
    check("stars")
        .isInt({ min: 1, max: 5 })
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors,
  ];
//creating a review image
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
    const reviewId = parseInt(req.params.reviewId);
    let { url } = req.body;
    const theReview = await ReviewImage.findByPk(reviewId);
    if(!theReview){
        res.status(404);
        return res.json({
            message: "Review couldn't be found",
        });
    }
    const newReviewImage = await ReviewImage.create({
        url,
        reviewId,
    });
    
    return res.status(200).json({id: newReviewImage.id, url: newReviewImage.url});
});

//Get all reviews of the current user
router.get('/current', requireAuth,
async (req, res) => {
    const { user } = req;
    try {
        const reviews = await Review.findAll( {where: { userId: user.id }});
        
         res.json({ Reviews: reviews });
    } catch (err) {
        res.status(400).json({ message: "Bad Request" });
    }
});


//Edit a review
router.put("/:reviewId", requireAuth, validateReview, async (req, res) => {
    const { user } = req;
    const { review, stars } = req.body;
    const { reviewId } = req.params;
    try {
        const existingReview = await Review.findByPk(reviewId);
        if (!existingReview) {
          return res.status(404).json({ message: "Review couldn't be found" });
        } 
        existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    return res.json(existingReview);
    }
 
   catch (err) {
    return res.status(400).json({
        message:'Bad Request'
    });
}
});

//Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const {reviewId} = req.params;
    const {user} = req;

    try {
        const review = await Review.findByPk(reviewId);
        if(!review){
            return res.status(404).json({ message: "Review couldn't be found"});
        }
        if (review.userId !== user.id){
            return res.status(403).json({message: 'Forbidden'});
        }
        await review.destroy();
        return res.json({message: 'Review deleted'});
    } catch (err) { return res.status(400).json ({
        message: 'Bad Request'
    })}
});

module.exports = router