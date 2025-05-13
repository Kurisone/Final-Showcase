const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validation middleware
const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),
  handleValidationErrors
];
// Add detailed logging
router.get('/', restoreUser, (req, res, next) => {
  console.log('Session restoration - req.user:', req.user); // Debug log
  
  try {
    if (!req.user) {
      console.log('No user found in session');
      return res.json({ user: null });
    }

    const safeUser = {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username
      // Add other safe fields
    };

    console.log('Restored user:', safeUser); // Debug log
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('Session restoration error:', err);
    return next(err);
  }
});
// Log in
router.post(
  '/',
  validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential
        }
      }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

// Sign up
router.post(
  '/signup',
  validateSignup,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, username } = req.body;
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ 
        firstName, 
        lastName, 
        email, 
        username, 
        hashedPassword 
      });

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = {};
        err.errors.forEach(error => {
          errors[error.path] = error.message;
        });
        return res.status(500).json({
          message: "User already exists",
          errors
        });
      }
      return next(err);
    }
  }
);

// Log out
router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

router.get('/', restoreUser, (req, res) => {
  const { user } = req;
  if (user) return res.json({ user });
  else return res.json({ user: null });
});

module.exports = router;