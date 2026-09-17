const { connectDB, sql } = require('../config/db');
const { resetDatabaseToDefault } = require('../config/initDb');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// --- LIKELIHOOD CRITERIA ---
const getLikelihoodCriteria = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT LikelihoodCriteriaID AS LikelihoodID, * FROM dbo.Master_LikelihoodCriteria WHERE IsActive = 1 ORDER BY LikelihoodScore ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likelihood criteria', error: error.message });
  }
};

const createLikelihoodCriteria = async (req, res) => {
  try {
    const { LikelihoodScore, LevelName, LevelNameTH, Definition, FrequencyDescription } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('LikelihoodScore', sql.Int, LikelihoodScore)
      .input('LevelName', sql.NVarChar, LevelName)
      .input('LevelNameTH', sql.NVarChar, LevelNameTH)
      .input('Definition', sql.NVarChar, Definition)
      .input('FrequencyDescription', sql.NVarChar, FrequencyDescription || '')
      .query(`
        INSERT INTO dbo.Master_LikelihoodCriteria (LikelihoodScore, LevelName, LevelNameTH, Definition, FrequencyDescription)
        VALUES (@LikelihoodScore, @LevelName, @LevelNameTH, @Definition, @FrequencyDescription)
      `);
    res.status(201).json({ message: 'Likelihood criteria created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating likelihood criteria', error: error.message });
  }
};

const updateLikelihoodCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { LevelName, LevelNameTH, Definition, FrequencyDescription } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('LevelName', sql.NVarChar, LevelName)
      .input('LevelNameTH', sql.NVarChar, LevelNameTH)
      .input('Definition', sql.NVarChar, Definition)
      .input('FrequencyDescription', sql.NVarChar, FrequencyDescription || '')
      .query(`
        UPDATE dbo.Master_LikelihoodCriteria SET
          LevelName = @LevelName, LevelNameTH = @LevelNameTH,
          Definition = @Definition, FrequencyDescription = @FrequencyDescription,
          UpdatedDate = GETDATE()
        WHERE LikelihoodCriteriaID = @id
      `);
    res.json({ message: 'Likelihood criteria updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating likelihood criteria', error: error.message });
  }
};

const deleteLikelihoodCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_LikelihoodCriteria SET IsActive = 0 WHERE LikelihoodCriteriaID = @id`);
    res.json({ message: 'Likelihood criteria deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting likelihood criteria', error: error.message });
  }
};

// --- IMPACT CRITERIA ---
const getImpactCriteria = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT * FROM dbo.Master_ImpactCriteria WHERE IsActive = 1 ORDER BY ImpactCategory ASC, ImpactScore ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching impact criteria', error: error.message });
  }
};

const createImpactCriteria = async (req, res) => {
  try {
    const { ImpactScore, ImpactCategory, LevelName, LevelNameTH, Definition, FinancialThreshold, OperationalImpact } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('ImpactScore', sql.Int, ImpactScore)
      .input('ImpactCategory', sql.NVarChar, ImpactCategory)
      .input('LevelName', sql.NVarChar, LevelName)
      .input('LevelNameTH', sql.NVarChar, LevelNameTH)
      .input('Definition', sql.NVarChar, Definition)
      .input('FinancialThreshold', sql.NVarChar, FinancialThreshold || '')
      .input('OperationalImpact', sql.NVarChar, OperationalImpact || '')
      .query(`
        INSERT INTO dbo.Master_ImpactCriteria (ImpactScore, ImpactCategory, LevelName, LevelNameTH, Definition, FinancialThreshold, OperationalImpact)
        VALUES (@ImpactScore, @ImpactCategory, @LevelName, @LevelNameTH, @Definition, @FinancialThreshold, @OperationalImpact)
      `);
    res.status(201).json({ message: 'Impact criteria created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating impact criteria', error: error.message });
  }
};

const updateImpactCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { LevelName, LevelNameTH, Definition, FinancialThreshold, OperationalImpact } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('LevelName', sql.NVarChar, LevelName)
      .input('LevelNameTH', sql.NVarChar, LevelNameTH)
      .input('Definition', sql.NVarChar, Definition)
      .input('FinancialThreshold', sql.NVarChar, FinancialThreshold || '')
      .input('OperationalImpact', sql.NVarChar, OperationalImpact || '')
      .query(`
        UPDATE dbo.Master_ImpactCriteria SET
          LevelName = @LevelName, LevelNameTH = @LevelNameTH,
          Definition = @Definition, FinancialThreshold = @FinancialThreshold, OperationalImpact = @OperationalImpact,
          UpdatedDate = GETDATE()
        WHERE ImpactCriteriaID = @id
      `);
    res.json({ message: 'Impact criteria updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating impact criteria', error: error.message });
  }
};

const deleteImpactCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_ImpactCriteria SET IsActive = 0 WHERE ImpactCriteriaID = @id`);
    res.json({ message: 'Impact criteria deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting impact criteria', error: error.message });
  }
};

// --- CATEGORIES ---
const getCategories = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_RiskCategory WHERE IsActive = 1 ORDER BY CategoryName ASC`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { CategoryCode, CategoryName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('CategoryCode', sql.NVarChar, CategoryCode)
      .input('CategoryName', sql.NVarChar, CategoryName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_RiskCategory (CategoryCode, CategoryName, Description) VALUES (@CategoryCode, @CategoryName, @Description)`);
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { CategoryCode, CategoryName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('CategoryCode', sql.NVarChar, CategoryCode)
      .input('CategoryName', sql.NVarChar, CategoryName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_RiskCategory SET CategoryCode = @CategoryCode, CategoryName = @CategoryName, Description = @Description, UpdatedDate = GETDATE() WHERE CategoryID = @id`);
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_RiskCategory SET IsActive = 0 WHERE CategoryID = @id`);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// --- DEPARTMENTS & PROCESSES ---
const getDepartments = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_Department WHERE IsActive = 1 ORDER BY DepartmentName ASC`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { DepartmentCode, DepartmentName, ManagerName } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('DepartmentCode', sql.NVarChar, DepartmentCode)
      .input('DepartmentName', sql.NVarChar, DepartmentName)
      .input('ManagerName', sql.NVarChar, ManagerName || '')
      .query(`INSERT INTO dbo.Master_Department (DepartmentCode, DepartmentName, ManagerName) VALUES (@DepartmentCode, @DepartmentName, @ManagerName)`);
    res.status(201).json({ message: 'Department created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { DepartmentCode, DepartmentName, ManagerName } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('DepartmentCode', sql.NVarChar, DepartmentCode)
      .input('DepartmentName', sql.NVarChar, DepartmentName)
      .input('ManagerName', sql.NVarChar, ManagerName || '')
      .query(`UPDATE dbo.Master_Department SET DepartmentCode = @DepartmentCode, DepartmentName = @DepartmentName, ManagerName = @ManagerName, UpdatedDate = GETDATE() WHERE DepartmentID = @id`);
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_Department SET IsActive = 0 WHERE DepartmentID = @id`);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
};

const getProcesses = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT p.*, d.DepartmentName FROM dbo.Master_Process p
      LEFT JOIN dbo.Master_Department d ON p.DepartmentID = d.DepartmentID
      WHERE p.IsActive = 1 ORDER BY p.ProcessName ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching processes', error: error.message });
  }
};

const createProcess = async (req, res) => {
  try {
    const { ProcessCode, ProcessName, DepartmentID, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('ProcessCode', sql.NVarChar, ProcessCode)
      .input('ProcessName', sql.NVarChar, ProcessName)
      .input('DepartmentID', sql.BigInt, DepartmentID || null)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_Process (ProcessCode, ProcessName, DepartmentID, Description) VALUES (@ProcessCode, @ProcessName, @DepartmentID, @Description)`);
    res.status(201).json({ message: 'Process created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating process', error: error.message });
  }
};

const deleteProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_Process SET IsActive = 0 WHERE ProcessID = @id`);
    res.json({ message: 'Process deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting process', error: error.message });
  }
};

// --- ASSETS, LOCATIONS, BUs ---
const getAssets = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_Asset WHERE IsActive = 1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assets', error: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { AssetCode, AssetName, AssetType, OwnerName, Criticality } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('AssetCode', sql.NVarChar, AssetCode)
      .input('AssetName', sql.NVarChar, AssetName)
      .input('AssetType', sql.NVarChar, AssetType || '')
      .input('OwnerName', sql.NVarChar, OwnerName || '')
      .input('Criticality', sql.NVarChar, Criticality || 'High')
      .query(`INSERT INTO dbo.Master_Asset (AssetCode, AssetName, AssetType, OwnerName, Criticality) VALUES (@AssetCode, @AssetName, @AssetType, @OwnerName, @Criticality)`);
    res.status(201).json({ message: 'Asset created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating asset', error: error.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_Asset SET IsActive = 0 WHERE AssetID = @id`);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting asset', error: error.message });
  }
};

const getLocations = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_Location WHERE IsActive = 1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const { LocationCode, LocationName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('LocationCode', sql.NVarChar, LocationCode)
      .input('LocationName', sql.NVarChar, LocationName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_Location (LocationCode, LocationName, Description) VALUES (@LocationCode, @LocationName, @Description)`);
    res.status(201).json({ message: 'Location created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_Location SET IsActive = 0 WHERE LocationID = @id`);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
};

const getBusinessUnits = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_BusinessUnit WHERE IsActive = 1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching business units', error: error.message });
  }
};

const createBusinessUnit = async (req, res) => {
  try {
    const { BUCode, BUName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('BUCode', sql.NVarChar, BUCode)
      .input('BUName', sql.NVarChar, BUName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_BusinessUnit (BUCode, BUName, Description) VALUES (@BUCode, @BUName, @Description)`);
    res.status(201).json({ message: 'Business unit created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating business unit', error: error.message });
  }
};

const deleteBusinessUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_BusinessUnit SET IsActive = 0 WHERE BUID = @id`);
    res.json({ message: 'Business unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting business unit', error: error.message });
  }
};

// --- STANDARDS & CLAUSES ---
const getStandards = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM dbo.Master_Standard WHERE IsActive = 1`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching standards', error: error.message });
  }
};

const createStandard = async (req, res) => {
  try {
    const { StandardCode, StandardName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('StandardCode', sql.NVarChar, StandardCode)
      .input('StandardName', sql.NVarChar, StandardName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_Standard (StandardCode, StandardName, Description) VALUES (@StandardCode, @StandardName, @Description)`);
    res.status(201).json({ message: 'Standard created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating standard', error: error.message });
  }
};

const deleteStandard = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_Standard SET IsActive = 0 WHERE StandardID = @id`);
    res.json({ message: 'Standard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting standard', error: error.message });
  }
};

const getStandardClauses = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT sc.*, s.StandardCode, s.StandardName FROM dbo.Master_StandardClause sc
      JOIN dbo.Master_Standard s ON sc.StandardID = s.StandardID
      WHERE sc.IsActive = 1 ORDER BY s.StandardID, sc.ClauseNo
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clauses', error: error.message });
  }
};

const createStandardClause = async (req, res) => {
  try {
    const { StandardID, ClauseNo, ClauseTitle, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('StandardID', sql.BigInt, StandardID)
      .input('ClauseNo', sql.NVarChar, ClauseNo)
      .input('ClauseTitle', sql.NVarChar, ClauseTitle)
      .input('Description', sql.NVarChar, Description || '')
      .query(`INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description) VALUES (@StandardID, @ClauseNo, @ClauseTitle, @Description)`);
    res.status(201).json({ message: 'Clause created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating clause', error: error.message });
  }
};

const deleteStandardClause = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_StandardClause SET IsActive = 0 WHERE ClauseID = @id`);
    res.json({ message: 'Clause deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting clause', error: error.message });
  }
};

const updateProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { ProcessCode, ProcessName, DepartmentID, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('ProcessCode', sql.NVarChar, ProcessCode)
      .input('ProcessName', sql.NVarChar, ProcessName)
      .input('DepartmentID', sql.BigInt, DepartmentID || null)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_Process SET ProcessCode = @ProcessCode, ProcessName = @ProcessName, DepartmentID = @DepartmentID, Description = @Description, UpdatedDate = GETDATE() WHERE ProcessID = @id`);
    res.json({ message: 'Process updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating process', error: error.message });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { AssetCode, AssetName, AssetType, OwnerName, Criticality, Category, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('AssetCode', sql.NVarChar, AssetCode)
      .input('AssetName', sql.NVarChar, AssetName)
      .input('AssetType', sql.NVarChar, AssetType || '')
      .input('OwnerName', sql.NVarChar, OwnerName || '')
      .input('Criticality', sql.NVarChar, Criticality || 'High')
      .input('Category', sql.NVarChar, Category || '')
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_Asset SET AssetCode = @AssetCode, AssetName = @AssetName, AssetType = @AssetType, OwnerName = @OwnerName, Criticality = @Criticality, Category = @Category, Description = @Description, UpdatedDate = GETDATE() WHERE AssetID = @id`);
    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating asset', error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { LocationCode, LocationName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('LocationCode', sql.NVarChar, LocationCode)
      .input('LocationName', sql.NVarChar, LocationName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_Location SET LocationCode = @LocationCode, LocationName = @LocationName, Description = @Description, UpdatedDate = GETDATE() WHERE LocationID = @id`);
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

const updateBusinessUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { BUCode, BUName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('BUCode', sql.NVarChar, BUCode)
      .input('BUName', sql.NVarChar, BUName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_BusinessUnit SET BUCode = @BUCode, BUName = @BUName, Description = @Description, UpdatedDate = GETDATE() WHERE BUID = @id`);
    res.json({ message: 'Business unit updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating business unit', error: error.message });
  }
};

const updateStandard = async (req, res) => {
  try {
    const { id } = req.params;
    const { StandardCode, StandardName, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('StandardCode', sql.NVarChar, StandardCode)
      .input('StandardName', sql.NVarChar, StandardName)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_Standard SET StandardCode = @StandardCode, StandardName = @StandardName, Description = @Description, UpdatedDate = GETDATE() WHERE StandardID = @id`);
    res.json({ message: 'Standard updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating standard', error: error.message });
  }
};

const updateStandardClause = async (req, res) => {
  try {
    const { id } = req.params;
    const { StandardID, ClauseNo, ClauseTitle, Description } = req.body;
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('StandardID', sql.BigInt, StandardID)
      .input('ClauseNo', sql.NVarChar, ClauseNo)
      .input('ClauseTitle', sql.NVarChar, ClauseTitle)
      .input('Description', sql.NVarChar, Description || '')
      .query(`UPDATE dbo.Master_StandardClause SET StandardID = @StandardID, ClauseNo = @ClauseNo, ClauseTitle = @ClauseTitle, Description = @Description, UpdatedDate = GETDATE() WHERE ClauseID = @id`);
    res.json({ message: 'Clause updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating clause', error: error.message });
  }
};

// --- AUDIT LOGS ---
const getAuditLogs = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`SELECT TOP 100 * FROM dbo.AuditLog ORDER BY LogID DESC`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

// --- EXCEL IMPORT / EXPORT / TEMPLATE HANDLERS ---
const exportExcelData = async (req, res) => {
  try {
    const pool = await connectDB();
    const wb = XLSX.utils.book_new();

    // 1. BusinessUnits
    const buResult = await pool.request().query('SELECT BUCode, BUName, Description FROM dbo.Master_BusinessUnit WHERE IsActive = 1');
    const wsBU = XLSX.utils.json_to_sheet(buResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsBU, 'BusinessUnits');

    // 2. Departments
    const deptResult = await pool.request().query(`
      SELECT d.DepartmentCode, d.DepartmentName, b.BUCode, d.ManagerName, d.Description 
      FROM dbo.Master_Department d 
      LEFT JOIN dbo.Master_BusinessUnit b ON d.BUID = b.BUID 
      WHERE d.IsActive = 1
    `);
    const wsDept = XLSX.utils.json_to_sheet(deptResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsDept, 'Departments');

    // 3. Users
    const userResult = await pool.request().query(`
      SELECT u.Username, u.FullName, u.Email, u.Role, d.DepartmentCode 
      FROM dbo.[User] u 
      LEFT JOIN dbo.Master_Department d ON u.DepartmentID = d.DepartmentID 
      WHERE u.IsActive = 1
    `);
    const wsUser = XLSX.utils.json_to_sheet(userResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsUser, 'Users');

    // 4. Locations
    const locResult = await pool.request().query('SELECT LocationCode, LocationName, Description FROM dbo.Master_Location WHERE IsActive = 1');
    const wsLoc = XLSX.utils.json_to_sheet(locResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsLoc, 'Locations');

    // 5. Processes
    const procResult = await pool.request().query(`
      SELECT p.ProcessCode, p.ProcessName, d.DepartmentCode, p.Description, p.IsCritical 
      FROM dbo.Master_Process p 
      LEFT JOIN dbo.Master_Department d ON p.DepartmentID = d.DepartmentID 
      WHERE p.IsActive = 1
    `);
    const wsProc = XLSX.utils.json_to_sheet(procResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsProc, 'Processes');

    // 6. Assets
    const assetResult = await pool.request().query(`
      SELECT a.AssetCode, a.AssetName, a.AssetType, d.DepartmentCode, l.LocationCode, a.OwnerName, a.Criticality 
      FROM dbo.Master_Asset a 
      LEFT JOIN dbo.Master_Department d ON a.OwnerDepartmentID = d.DepartmentID 
      LEFT JOIN dbo.Master_Location l ON a.LocationID = l.LocationID 
      WHERE a.IsActive = 1
    `);
    const wsAsset = XLSX.utils.json_to_sheet(assetResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsAsset, 'Assets');

    // 7. Categories
    const catResult = await pool.request().query('SELECT CategoryCode, CategoryName, Description FROM dbo.Master_RiskCategory WHERE IsActive = 1');
    const wsCat = XLSX.utils.json_to_sheet(catResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsCat, 'Categories');

    // 8. Standards
    const stdResult = await pool.request().query(`
      SELECT s.StandardCode, s.StandardName, s.Description, c.ClauseNo, c.ClauseTitle, c.Description AS ClauseDescription 
      FROM dbo.Master_Standard s 
      LEFT JOIN dbo.Master_StandardClause c ON s.StandardID = c.StandardID 
      WHERE s.IsActive = 1
    `);
    const wsStd = XLSX.utils.json_to_sheet(stdResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsStd, 'Standards');

    // 9. Risks
    const riskResult = await pool.request().query(`
      SELECT 
        r.RiskNo, r.RiskTitle, r.RiskDescription, c.CategoryCode, d.DepartmentCode, p.ProcessCode, l.LocationCode, b.BUCode, a.AssetCode, u.Username AS RiskOwnerUsername,
        r.Threat, r.Vulnerability, r.RiskCause, r.RiskConsequence, r.ExistingCondition, r.PotentialImpact, r.Status
      FROM dbo.RiskHeader r
      LEFT JOIN dbo.Master_RiskCategory c ON r.CategoryID = c.CategoryID
      LEFT JOIN dbo.Master_Department d ON r.DepartmentID = d.DepartmentID
      LEFT JOIN dbo.Master_Process p ON r.ProcessID = p.ProcessID
      LEFT JOIN dbo.Master_Location l ON r.LocationID = l.LocationID
      LEFT JOIN dbo.Master_BusinessUnit b ON r.BUID = b.BUID
      LEFT JOIN dbo.Master_Asset a ON r.AssetID = a.AssetID
      LEFT JOIN dbo.[User] u ON r.RiskOwnerID = u.UserID
    `);
    const wsRisk = XLSX.utils.json_to_sheet(riskResult.recordset);
    XLSX.utils.book_append_sheet(wb, wsRisk, 'Risks');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="IT_Risk_Master_Data_Export.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'Error exporting Excel data', error: error.message });
  }
};

const importExcelData = async (req, res) => {
  try {
    let fileBuffer;
    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer;
    } else if (req.body && req.body.fileBase64) {
      const base64Data = req.body.fileBase64.replace(/^data:.*;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      fileBuffer = req.body;
    } else {
      return res.status(400).json({ message: 'No file uploaded or fileBase64 provided' });
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const pool = await connectDB();
    const summary = { businessUnits: 0, departments: 0, users: 0, locations: 0, processes: 0, assets: 0, categories: 0, standards: 0, risks: 0 };

    // 1. BusinessUnits
    if (workbook.Sheets['BusinessUnits']) {
      const buRows = XLSX.utils.sheet_to_json(workbook.Sheets['BusinessUnits']);
      for (const row of buRows) {
        if (!row.BUCode || !row.BUName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_BusinessUnit WHERE BUCode = N'${row.BUCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_BusinessUnit (BUCode, BUName, Description, IsActive)
            VALUES (N'${row.BUCode.replace(/'/g, "''")}', N'${row.BUName.replace(/'/g, "''")}', N'${(row.Description || '').replace(/'/g, "''")}', 1);
          END;
        `);
        summary.businessUnits++;
      }
    }

    // 2. Departments
    if (workbook.Sheets['Departments']) {
      const deptRows = XLSX.utils.sheet_to_json(workbook.Sheets['Departments']);
      for (const row of deptRows) {
        if (!row.DepartmentCode || !row.DepartmentName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Department WHERE DepartmentCode = N'${row.DepartmentCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_Department (DepartmentCode, DepartmentName, BUID, ManagerName, Description, IsActive)
            VALUES (
              N'${row.DepartmentCode.replace(/'/g, "''")}',
              N'${row.DepartmentName.replace(/'/g, "''")}',
              (SELECT TOP 1 BUID FROM dbo.Master_BusinessUnit WHERE BUCode = N'${(row.BUCode || '').replace(/'/g, "''")}'),
              N'${(row.ManagerName || '').replace(/'/g, "''")}',
              N'${(row.Description || '').replace(/'/g, "''")}',
              1
            );
          END;
        `);
        summary.departments++;
      }
    }

    // 3. Users
    if (workbook.Sheets['Users']) {
      const userRows = XLSX.utils.sheet_to_json(workbook.Sheets['Users']);
      for (const row of userRows) {
        if (!row.Username || !row.FullName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Username = N'${row.Username.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.[User] (Username, FullName, Email, Role, DepartmentID, IsActive)
            VALUES (
              N'${row.Username.replace(/'/g, "''")}',
              N'${row.FullName.replace(/'/g, "''")}',
              N'${(row.Email || '').replace(/'/g, "''")}',
              N'${(row.Role || 'User').replace(/'/g, "''")}',
              (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = N'${(row.DepartmentCode || '').replace(/'/g, "''")}'),
              1
            );
          END;
        `);
        summary.users++;
      }
    }

    // 4. Locations
    if (workbook.Sheets['Locations']) {
      const locRows = XLSX.utils.sheet_to_json(workbook.Sheets['Locations']);
      for (const row of locRows) {
        if (!row.LocationCode || !row.LocationName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Location WHERE LocationCode = N'${row.LocationCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_Location (LocationCode, LocationName, Description, IsActive)
            VALUES (
              N'${row.LocationCode.replace(/'/g, "''")}',
              N'${row.LocationName.replace(/'/g, "''")}',
              N'${(row.Description || '').replace(/'/g, "''")}',
              1
            );
          END;
        `);
        summary.locations++;
      }
    }

    // 5. Processes
    if (workbook.Sheets['Processes']) {
      const procRows = XLSX.utils.sheet_to_json(workbook.Sheets['Processes']);
      for (const row of procRows) {
        if (!row.ProcessCode || !row.ProcessName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Process WHERE ProcessCode = N'${row.ProcessCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_Process (ProcessCode, ProcessName, DepartmentID, Description, IsCritical, IsActive)
            VALUES (
              N'${row.ProcessCode.replace(/'/g, "''")}',
              N'${row.ProcessName.replace(/'/g, "''")}',
              (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = N'${(row.DepartmentCode || '').replace(/'/g, "''")}'),
              N'${(row.Description || '').replace(/'/g, "''")}',
              ${row.IsCritical ? 1 : 0},
              1
            );
          END;
        `);
        summary.processes++;
      }
    }

    // 6. Assets
    if (workbook.Sheets['Assets']) {
      const assetRows = XLSX.utils.sheet_to_json(workbook.Sheets['Assets']);
      for (const row of assetRows) {
        if (!row.AssetCode || !row.AssetName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Asset WHERE AssetCode = N'${row.AssetCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_Asset (AssetCode, AssetName, AssetType, OwnerDepartmentID, LocationID, OwnerName, Criticality, IsActive)
            VALUES (
              N'${row.AssetCode.replace(/'/g, "''")}',
              N'${row.AssetName.replace(/'/g, "''")}',
              N'${(row.AssetType || '').replace(/'/g, "''")}',
              (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = N'${(row.DepartmentCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 LocationID FROM dbo.Master_Location WHERE LocationCode = N'${(row.LocationCode || '').replace(/'/g, "''")}'),
              N'${(row.OwnerName || '').replace(/'/g, "''")}',
              N'${(row.Criticality || 'Medium').replace(/'/g, "''")}',
              1
            );
          END;
        `);
        summary.assets++;
      }
    }

    // 7. Categories
    if (workbook.Sheets['Categories']) {
      const catRows = XLSX.utils.sheet_to_json(workbook.Sheets['Categories']);
      for (const row of catRows) {
        if (!row.CategoryCode || !row.CategoryName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_RiskCategory WHERE CategoryCode = N'${row.CategoryCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_RiskCategory (CategoryCode, CategoryName, Description, IsActive)
            VALUES (
              N'${row.CategoryCode.replace(/'/g, "''")}',
              N'${row.CategoryName.replace(/'/g, "''")}',
              N'${(row.Description || '').replace(/'/g, "''")}',
              1
            );
          END;
        `);
        summary.categories++;
      }
    }

    // 8. Standards
    if (workbook.Sheets['Standards']) {
      const stdRows = XLSX.utils.sheet_to_json(workbook.Sheets['Standards']);
      for (const row of stdRows) {
        if (!row.StandardCode || !row.StandardName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Standard WHERE StandardCode = N'${row.StandardCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_Standard (StandardCode, StandardName, Description, IsActive)
            VALUES (
              N'${row.StandardCode.replace(/'/g, "''")}',
              N'${row.StandardName.replace(/'/g, "''")}',
              N'${(row.Description || '').replace(/'/g, "''")}',
              1
            );
          END;
        `);

        if (row.ClauseNo && row.ClauseTitle) {
          await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.Master_StandardClause WHERE ClauseNo = N'${row.ClauseNo.replace(/'/g, "''")}' AND StandardID = (SELECT TOP 1 StandardID FROM dbo.Master_Standard WHERE StandardCode = N'${row.StandardCode.replace(/'/g, "''")}'))
            BEGIN
              INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
              VALUES (
                (SELECT TOP 1 StandardID FROM dbo.Master_Standard WHERE StandardCode = N'${row.StandardCode.replace(/'/g, "''")}'),
                N'${row.ClauseNo.replace(/'/g, "''")}',
                N'${row.ClauseTitle.replace(/'/g, "''")}',
                N'${(row.ClauseDescription || '').replace(/'/g, "''")}'
              );
            END;
          `);
        }
        summary.standards++;
      }
    }

    // 9. Risks
    if (workbook.Sheets['Risks']) {
      const riskRows = XLSX.utils.sheet_to_json(workbook.Sheets['Risks']);
      for (const row of riskRows) {
        if (!row.RiskNo || !row.RiskTitle) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.RiskHeader WHERE RiskNo = N'${row.RiskNo.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.RiskHeader (
              RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
              CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
              Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
            ) VALUES (
              N'${row.RiskNo.replace(/'/g, "''")}',
              N'${row.RiskTitle.replace(/'/g, "''")}',
              N'${(row.RiskDescription || '').replace(/'/g, "''")}',
              GETDATE(), DATEADD(month, 6, GETDATE()), 'Initial', 'IT Risk',
              (SELECT TOP 1 CategoryID FROM dbo.Master_RiskCategory WHERE CategoryCode = N'${(row.CategoryCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = N'${(row.DepartmentCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 ProcessID FROM dbo.Master_Process WHERE ProcessCode = N'${(row.ProcessCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 LocationID FROM dbo.Master_Location WHERE LocationCode = N'${(row.LocationCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 BUID FROM dbo.Master_BusinessUnit WHERE BUCode = N'${(row.BUCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 AssetID FROM dbo.Master_Asset WHERE AssetCode = N'${(row.AssetCode || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 UserID FROM dbo.[User] WHERE Username = N'${(row.RiskOwnerUsername || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 UserID FROM dbo.[User] WHERE Username = N'${(row.RiskOwnerUsername || '').replace(/'/g, "''")}'),
              (SELECT TOP 1 UserID FROM dbo.[User] WHERE Role = 'Admin'),
              N'${(row.Threat || '').replace(/'/g, "''")}',
              N'${(row.Vulnerability || '').replace(/'/g, "''")}',
              N'${(row.RiskCause || '').replace(/'/g, "''")}',
              N'${(row.RiskConsequence || '').replace(/'/g, "''")}',
              N'${(row.ExistingCondition || '').replace(/'/g, "''")}',
              N'${(row.PotentialImpact || '').replace(/'/g, "''")}',
              N'${(row.Status || 'Open').replace(/'/g, "''")}'
            );
          END;
        `);
        summary.risks++;
      }
    }

    res.json({ message: 'Excel data imported successfully', summary });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ message: 'Error importing Excel data', error: error.message });
  }
};

const downloadExcelTemplate = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../../../database/Master_Data_Template.xlsx');
    if (fs.existsSync(templatePath)) {
      res.download(templatePath, 'Master_Data_Template.xlsx');
    } else {
      res.status(404).json({ message: 'Template file not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error downloading template', error: error.message });
  }
};

const resetDatabaseHandler = async (req, res) => {
  try {
    const result = await resetDatabaseToDefault();
    res.json({ message: 'Database reset to factory default settings successfully!', details: result });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ message: 'Error resetting database', error: error.message });
  }
};

module.exports = {
  getLikelihoodCriteria,
  createLikelihoodCriteria,
  updateLikelihoodCriteria,
  deleteLikelihoodCriteria,
  getImpactCriteria,
  createImpactCriteria,
  updateImpactCriteria,
  deleteImpactCriteria,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getProcesses,
  createProcess,
  updateProcess,
  deleteProcess,
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getBusinessUnits,
  createBusinessUnit,
  updateBusinessUnit,
  deleteBusinessUnit,
  getStandards,
  createStandard,
  updateStandard,
  deleteStandard,
  getStandardClauses,
  createStandardClause,
  updateStandardClause,
  deleteStandardClause,
  getAuditLogs,
  exportExcelData,
  importExcelData,
  downloadExcelTemplate,
  resetDatabaseHandler,
};
