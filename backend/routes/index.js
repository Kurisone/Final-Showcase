const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

// API routes
router.use('/api', apiRouter);

// Static routes for production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });

  router.use(express.static(path.resolve('../frontend/dist')));

  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
}

module.exports = router;