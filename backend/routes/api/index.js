// backend/routes/api/index.js
const router = require('express').Router();
const { setTokenCookie } = require('../../utils/auth.js');
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const bookingsRouter = require('./bookings.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const reviewimagesRouter = require('./reviewimages.js');
const spotimagesRouter = require('./spotimages.js')

const { restoreUser, requireAuth } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);
router.use('/spot-images', spotimagesRouter)
router.use('/session', sessionRouter);
router.use('/spots',spotsRouter);
router.use('/users', usersRouter);
router.use('/bookings', bookingsRouter);
router.use('/reviews', reviewsRouter);
router.use('/review-images', reviewimagesRouter)


router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});


// GET /api/require-auth
router.get('/require-auth',requireAuth,(req, res) => {
  return res.json(req.user);
});

module.exports = router;
