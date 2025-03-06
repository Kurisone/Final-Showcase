const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require('sequelize');

const router = express.Router();

// Middleware to validate booking input

const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .withMessage('Start date is required')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  check('endDate')
    .exists({ checkFalsy: true })
    .withMessage('End date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      } 
      
      return true;
    }),
  handleValidationErrors,
];

// Middleware to check for booking conflicts

const checkBookingConflicts = async (req, res, next) => {
  const { spotId } = req.booking;
  const { startDate, endDate } = req.body;

  const conflictingBookings = await Booking.findAll({
    where: {
      spotId,
      
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  next();
};

// Middleware to check if booking is in the past

const checkPastBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  if (new Date(booking.endDate) < new Date()) {
    return res.status(403).json({ message: "Past bookings can't be modified" });
  }

  req.booking = booking;
  next();
};

// Middleware to check if booking has started

const checkStartedBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  if (new Date(booking.startDate) <= new Date()) {
    return res.status(403).json({ message: "Bookings that have been started can't be deleted" });
  }

  req.booking = booking;
  next();
};

// Get all bookings for the current user

router.get('/current', requireAuth, async (req, res) => {
  const { id } = req.user;
  const bookings = await Booking.findAll({
    where: { userId: id },
    include: [{ model: Spot, attributes: { exclude: ['description', 'createdAt', 'updatedAt'] } }],
  });
  res.json({ Bookings: bookings });
});

// Create a new booking at a spot based on the spotId

router.post('//:spotId/bookings', requireAuth, validateBooking, checkBookingConflicts, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const newBooking = await Booking.create({
    spotId,
    userId: id,
    startDate,
    endDate,
  });

  res.status(201).json(newBooking);
});

// Edit a booking

router.put('/:bookingId', requireAuth, validateBooking, checkPastBooking, checkBookingConflicts, async (req, res) => {
  const { startDate, endDate } = req.body;
  const { id } = req.user;
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "The Booking couldn't be found" });
  }

  if (booking.userId !== User.id) {
    return res.status(403).json({ message: "Past bookings can't be modified"})
  }

  booking.startDate = startDate;
  booking.endDate = endDate;
  await booking.save();

  res.json(booking);
});

// Delete a booking

router.delete('/:bookingId', requireAuth, checkStartedBooking, async (req, res) => {
  const booking = req.booking;

  await booking.destroy();
  res.json({ message: 'Successfully deleted' });
});

module.exports = router;