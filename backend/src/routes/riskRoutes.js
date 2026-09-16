const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.get('/', riskController.getAllRisks);
router.get('/:id', riskController.getRiskById);
router.post('/', riskController.createRisk);
router.put('/:id', riskController.updateRisk);
router.delete('/:id', riskController.deleteRisk);

module.exports = router;
