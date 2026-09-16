const { connectDB, sql } = require('../config/db');

// --- LIKELIHOOD CRITERIA ---
const getLikelihoodCriteria = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT * FROM dbo.Master_LikelihoodCriteria WHERE IsActive = 1 ORDER BY LikelihoodScore ASC
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
        WHERE LikelihoodID = @id
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
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_LikelihoodCriteria SET IsActive = 0 WHERE LikelihoodID = @id`);
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
        WHERE ImpactID = @id
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
    await pool.request().input('id', sql.BigInt, id).query(`UPDATE dbo.Master_ImpactCriteria SET IsActive = 0 WHERE ImpactID = @id`);
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
  deleteProcess,
  getAssets,
  createAsset,
  deleteAsset,
  getLocations,
  createLocation,
  deleteLocation,
  getBusinessUnits,
  createBusinessUnit,
  deleteBusinessUnit,
  getStandards,
  createStandard,
  deleteStandard,
  getStandardClauses,
  createStandardClause,
  deleteStandardClause,
  getAuditLogs,
};
