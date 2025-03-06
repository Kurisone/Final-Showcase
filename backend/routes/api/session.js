// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


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
       
        return next({"message":"Invalid credentials","statusCode":401});
      }
  
      const safeUser = {
        id: user.id,
        firstName: user.firstName, 
        lastName: user.lastName,     
        email: user.email,
        username: user.username,
      };
  
      await setTokenCookie(res, safeUser);
  
       res.json({
        'user': safeUser
      });
    }
  );
// Log out
router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      res.json({ message: 'success' });
    }
  );
// Restore session user
router.get(
    '/',
    (req, res) => {
      const { user } = req;
      if (user) {
        console.log(user)
        const safeUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        };
         res.json({
          user: safeUser
        });
      } else res.json({ user: null });
    }
  );

module.exports = router;