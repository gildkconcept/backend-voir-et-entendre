const express = require('express');
const router = express.Router();
const { getLinks } = require('../controllers/linkController');

router.get('/', getLinks);

module.exports = router;