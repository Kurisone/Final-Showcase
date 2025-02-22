const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { User } = require('../../db/models');

// Validation middleware for login
const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors,
];

// POST /api/session (Log in)
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  // Find user by email or username
  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential,
      },
    },
  });

  // Check if user exists and password is correct
  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    return next(err);
  }

  // Create a safe user object (without sensitive data)
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  // Set token cookie and return safe user
  await setTokenCookie(res, safeUser);
  return res.json({ user: safeUser });
});

// Log out
router.delete('/', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
});

// Restore session user
router.get('/', restoreUser, (req, res) => {
  const { user } = req;

  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return res.json({ user: safeUser });
  } else {
    return res.json({ user: null });
  }
});

module.exports = router;