const express = require('express');
const { evaluateCustomRisk } = require('../controllers/riskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/evaluate', evaluateCustomRisk);

module.exports = router;
