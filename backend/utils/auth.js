const { User } = require('../db/models');

// Session restoration middleware
const restoreUser = (req, res, next) => {
  if (req.session.userId) {
    User.findByPk(req.session.userId)
      .then(user => {
        if (user) {
          req.user = user.toSafeObject(); // Ensure sensitive data is removed
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
};

// CSRF protection middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
  next();
};

module.exports = { 
  restoreUser,
  requireAuth
};