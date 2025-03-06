const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { SpotImage } = require('../../db/models');
const router = express.Router();


//delete a spot image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const imageId = parseInt(req.params.imageId);
    const theImage = await SpotImage.findByPk(imageId);
    if (!theImage){
        return res.json({
            message: "Spot Image couldn't be found",
            
        });
    }
    await theImage.destroy();
    return res.json({
        message: "Successfully Deleted",
        
    });
    
});

module.exports = router;