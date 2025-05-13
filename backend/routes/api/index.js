const router = require('express').Router();
const usersRouter = require('./users.js');
const bookingsRouter = require('./bookings.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const reviewimagesRouter = require('./reviewimages.js');
const spotimagesRouter = require('./spotimages.js');
const { restoreUser, requireAuth } = require("../../utils/auth.js");
const sessionRouter = require('./session');

// CSRF Token Route
router.get('/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.json({ 'XSRF-Token': csrfToken });
});

// Connect restoreUser middleware
router.use(restoreUser);

// API routes
router.use('/spot-images', spotimagesRouter);
router.use('/session', sessionRouter);
router.use('/spots', spotsRouter);
router.use('/users', usersRouter);
router.use('/bookings', bookingsRouter);
router.use('/reviews', reviewsRouter);
router.use('/review-images', reviewimagesRouter);
router.use(restoreUser);
router.use('/session', sessionRouter);

// Test routes
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

router.get('/require-auth', requireAuth, (req, res) => {
  return res.json(req.user);
});

module.exports = router;