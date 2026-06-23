const express = require('express');
const router = express.Router();
const { trackClick } = require('../controllers/clickController');

router.post('/', trackClick);

module.exports = router;