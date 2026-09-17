const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');

// Likelihood & Impact Criteria
router.get('/likelihoods', masterController.getLikelihoodCriteria);
router.post('/likelihoods', masterController.createLikelihoodCriteria);
router.put('/likelihoods/:id', masterController.updateLikelihoodCriteria);
router.delete('/likelihoods/:id', masterController.deleteLikelihoodCriteria);

router.get('/impacts', masterController.getImpactCriteria);
router.post('/impacts', masterController.createImpactCriteria);
router.put('/impacts/:id', masterController.updateImpactCriteria);
router.delete('/impacts/:id', masterController.deleteImpactCriteria);

// Categories
router.get('/categories', masterController.getCategories);
router.post('/categories', masterController.createCategory);
router.put('/categories/:id', masterController.updateCategory);
router.delete('/categories/:id', masterController.deleteCategory);

// Org Structure & Assets
router.get('/departments', masterController.getDepartments);
router.post('/departments', masterController.createDepartment);
router.put('/departments/:id', masterController.updateDepartment);
router.delete('/departments/:id', masterController.deleteDepartment);

router.get('/processes', masterController.getProcesses);
router.post('/processes', masterController.createProcess);
router.put('/processes/:id', masterController.updateProcess);
router.delete('/processes/:id', masterController.deleteProcess);

router.get('/assets', masterController.getAssets);
router.post('/assets', masterController.createAsset);
router.put('/assets/:id', masterController.updateAsset);
router.delete('/assets/:id', masterController.deleteAsset);

router.get('/locations', masterController.getLocations);
router.post('/locations', masterController.createLocation);
router.put('/locations/:id', masterController.updateLocation);
router.delete('/locations/:id', masterController.deleteLocation);

router.get('/bus', masterController.getBusinessUnits);
router.post('/bus', masterController.createBusinessUnit);
router.put('/bus/:id', masterController.updateBusinessUnit);
router.delete('/bus/:id', masterController.deleteBusinessUnit);

// Standards & Clauses
router.get('/standards', masterController.getStandards);
router.post('/standards', masterController.createStandard);
router.put('/standards/:id', masterController.updateStandard);
router.delete('/standards/:id', masterController.deleteStandard);

router.get('/clauses', masterController.getStandardClauses);
router.post('/clauses', masterController.createStandardClause);
router.put('/clauses/:id', masterController.updateStandardClause);
router.delete('/clauses/:id', masterController.deleteStandardClause);

// Audit Logs
router.get('/audit-logs', masterController.getAuditLogs);

// Excel Import / Export / Template / Reset
router.get('/excel-export', masterController.exportExcelData);
router.post('/excel-import', masterController.importExcelData);
router.get('/excel-template', masterController.downloadExcelTemplate);
router.post('/reset-default', masterController.resetDatabaseHandler);

module.exports = router;
