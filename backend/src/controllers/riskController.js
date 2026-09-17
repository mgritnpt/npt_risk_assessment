const { connectDB, sql } = require('../config/db');

// Helper for safe BigInt parsing (prevents "0", "", null, undefined, false, NaN from throwing SQL errors)
const parseBigInt = (val) => {
  if (val === null || val === undefined || val === '' || val === 0 || val === '0' || val === false) return null;
  const num = parseInt(val, 10);
  return isNaN(num) || num <= 0 ? null : num;
};

// Helper to record audit log
async function createAuditLog(transaction, userId, action, tableName, recordId, oldValue, newValue) {
  const req = transaction ? new sql.Request(transaction) : (await connectDB()).request();
  await req
    .input('UserID', sql.NVarChar, userId || 'SYSTEM')
    .input('Action', sql.NVarChar, action)
    .input('TableName', sql.NVarChar, tableName)
    .input('RecordID', sql.NVarChar, String(recordId))
    .input('OldValue', sql.NVarChar, oldValue ? JSON.stringify(oldValue) : null)
    .input('NewValue', sql.NVarChar, newValue ? JSON.stringify(newValue) : null)
    .query(`
      INSERT INTO dbo.AuditLog (UserID, Action, TableName, RecordID, OldValue, NewValue)
      VALUES (@UserID, @Action, @TableName, @RecordID, @OldValue, @NewValue)
    `);
}

// 1. GET ALL RISKS WITH FILTERS
const getAllRisks = async (req, res) => {
  try {
    const pool = await connectDB();
    const { search, categoryID, departmentID, status, likelihood, impact } = req.query;

    let query = `
      SELECT 
        r.RiskID, r.RiskNo, r.RiskTitle, r.RiskDescription, r.AssessmentDate, r.ReviewDate,
        r.AssessmentType, r.RiskType, r.Status, r.IsActive, r.CreateDate,
        c.CategoryID, c.CategoryName, c.CategoryCode,
        d.DepartmentID, d.DepartmentName, d.DepartmentCode,
        p.ProcessID, p.ProcessName,
        a.AssetID, a.AssetName,
        loc.LocationID, loc.LocationName,
        bu.BUID, bu.BUName,
        uOwner.FullName AS RiskOwnerName,
        
        -- Inherent Risk Assessment
        ia.Likelihood AS InherentLikelihood,
        ia.Impact AS InherentImpact,
        ia.RiskScore AS InherentScore,
        ia.RiskLevel AS InherentLevel,

        -- Residual Risk Assessment
        ra.Likelihood AS ResidualLikelihood,
        ra.Impact AS ResidualImpact,
        ra.RiskScore AS ResidualScore,
        ra.RiskLevel AS ResidualLevel,

        -- Standard Mapping Count
        (SELECT COUNT(*) FROM dbo.RiskStandardMapping rsm WHERE rsm.RiskID = r.RiskID) AS StandardMappingCount,

        -- Primary Control Name
        (SELECT TOP 1 ControlName FROM dbo.RiskControl rc WHERE rc.RiskID = r.RiskID) AS PrimaryControlName

      FROM dbo.RiskHeader r
      LEFT JOIN dbo.Master_RiskCategory c ON r.CategoryID = c.CategoryID
      LEFT JOIN dbo.Master_Department d ON r.DepartmentID = d.DepartmentID
      LEFT JOIN dbo.Master_Process p ON r.ProcessID = p.ProcessID
      LEFT JOIN dbo.Master_Asset a ON r.AssetID = a.AssetID
      LEFT JOIN dbo.Master_Location loc ON r.LocationID = loc.LocationID
      LEFT JOIN dbo.Master_BusinessUnit bu ON r.BUID = bu.BUID
      LEFT JOIN dbo.[User] uOwner ON r.RiskOwnerID = uOwner.UserID
      LEFT JOIN dbo.RiskAssessment ia ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      LEFT JOIN dbo.RiskAssessment ra ON r.RiskID = ra.RiskID AND ra.AssessmentType = 'RESIDUAL'
      WHERE r.IsActive = 1
    `;

    const request = pool.request();

    if (search) {
      query += ` AND (r.RiskNo LIKE @search OR r.RiskTitle LIKE @search OR r.Threat LIKE @search OR r.Vulnerability LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    if (categoryID) {
      query += ` AND r.CategoryID = @categoryID`;
      request.input('categoryID', sql.BigInt, categoryID);
    }
    if (departmentID) {
      query += ` AND r.DepartmentID = @departmentID`;
      request.input('departmentID', sql.BigInt, departmentID);
    }
    if (status) {
      query += ` AND r.Status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    if (likelihood) {
      query += ` AND ia.Likelihood = @likelihood`;
      request.input('likelihood', sql.Int, parseInt(likelihood, 10));
    }
    if (impact) {
      query += ` AND ia.Impact = @impact`;
      request.input('impact', sql.Int, parseInt(impact, 10));
    }

    query += ` ORDER BY r.RiskID DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ message: 'Error fetching risks', error: error.message });
  }
};

// 2. GET SINGLE RISK WITH COMPLETE TRACEABILITY
const getRiskById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // 1. Header Detail
    const headerResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          r.*,
          c.CategoryName, d.DepartmentName, p.ProcessName, a.AssetName,
          loc.LocationName, bu.BUName,
          uOwner.FullName AS RiskOwnerName
        FROM dbo.RiskHeader r
        LEFT JOIN dbo.Master_RiskCategory c ON r.CategoryID = c.CategoryID
        LEFT JOIN dbo.Master_Department d ON r.DepartmentID = d.DepartmentID
        LEFT JOIN dbo.Master_Process p ON r.ProcessID = p.ProcessID
        LEFT JOIN dbo.Master_Asset a ON r.AssetID = a.AssetID
        LEFT JOIN dbo.Master_Location loc ON r.LocationID = loc.LocationID
        LEFT JOIN dbo.Master_BusinessUnit bu ON r.BUID = bu.BUID
        LEFT JOIN dbo.[User] uOwner ON r.RiskOwnerID = uOwner.UserID
        WHERE r.RiskID = @id AND r.IsActive = 1
      `);

    if (headerResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Risk not found' });
    }
    const riskHeader = headerResult.recordset[0];

    // 2. Assessments (Inherent & Residual)
    const assessmentResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`SELECT * FROM dbo.RiskAssessment WHERE RiskID = @id`);

    const inherentAssessment = assessmentResult.recordset.find(a => a.AssessmentType === 'INHERENT') || null;
    const residualAssessment = assessmentResult.recordset.find(a => a.AssessmentType === 'RESIDUAL') || null;

    // 3. Controls
    const controlsResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`SELECT * FROM dbo.RiskControl WHERE RiskID = @id`);

    // 4. Standards Mapped
    const standardsResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          rsm.*,
          s.StandardCode, s.StandardName,
          sc.ClauseNo, sc.ClauseTitle
        FROM dbo.RiskStandardMapping rsm
        LEFT JOIN dbo.Master_Standard s ON rsm.StandardID = s.StandardID
        LEFT JOIN dbo.Master_StandardClause sc ON rsm.ClauseID = sc.ClauseID
        WHERE rsm.RiskID = @id
      `);

    // 5. Treatment Actions
    const actionsResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`SELECT * FROM dbo.RiskTreatmentAction WHERE RiskID = @id`);

    // 6. Acceptance
    const acceptanceResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`SELECT TOP 1 * FROM dbo.RiskAcceptance WHERE RiskID = @id`);
    const acceptance = acceptanceResult.recordset[0] || null;

    res.json({
      header: riskHeader,
      inherentAssessment,
      residualAssessment,
      controls: controlsResult.recordset,
      standards: standardsResult.recordset,
      actions: actionsResult.recordset,
      acceptance
    });

  } catch (error) {
    console.error('Error fetching risk detail:', error);
    res.status(500).json({ message: 'Error fetching risk detail', error: error.message });
  }
};

// Helper for Risk Level calculation
const calcLevel = (score) => {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

// 3. CREATE FULL 7-STEP RISK (ATOMIC TRANSACTION)
const createRisk = async (req, res) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const {
      header = {},
      inherentAssessment = null,
      residualAssessment = null,
      controls = [],
      standards = [],
      actions = [],
      acceptance = null
    } = req.body;

    // Generate RiskNo if not provided (e.g. IT-R-2026-003)
    let riskNo = header.RiskNo;
    if (!riskNo) {
      const countRes = await new sql.Request(transaction).query(`SELECT COUNT(*) AS total FROM dbo.RiskHeader`);
      const nextNum = (countRes.recordset[0].total + 1).toString().padStart(3, '0');
      const year = new Date().getFullYear();
      riskNo = `IT-R-${year}-${nextNum}`;
    }

    // 1. Insert RiskHeader
    const headerReq = new sql.Request(transaction);
    headerReq
      .input('RiskNo', sql.NVarChar, riskNo)
      .input('RiskTitle', sql.NVarChar, header.RiskTitle || '')
      .input('RiskDescription', sql.NVarChar, header.RiskDescription || '')
      .input('AssessmentDate', sql.Date, header.AssessmentDate || new Date())
      .input('ReviewDate', sql.Date, header.ReviewDate || null)
      .input('AssessmentType', sql.NVarChar, header.AssessmentType || 'Initial')
      .input('RiskType', sql.NVarChar, header.RiskType || 'IT Risk')
      .input('CategoryID', sql.BigInt, parseBigInt(header.CategoryID))
      .input('DepartmentID', sql.BigInt, parseBigInt(header.DepartmentID))
      .input('ProcessID', sql.BigInt, parseBigInt(header.ProcessID))
      .input('LocationID', sql.BigInt, parseBigInt(header.LocationID))
      .input('BUID', sql.BigInt, parseBigInt(header.BUID))
      .input('AssetID', sql.BigInt, parseBigInt(header.AssetID))
      .input('RiskOwnerID', sql.BigInt, parseBigInt(header.RiskOwnerID))
      .input('AssessorID', sql.BigInt, parseBigInt(header.AssessorID))
      .input('ApproverID', sql.BigInt, parseBigInt(header.ApproverID))
      .input('Threat', sql.NVarChar, header.Threat || '')
      .input('Vulnerability', sql.NVarChar, header.Vulnerability || '')
      .input('RiskCause', sql.NVarChar, header.RiskCause || '')
      .input('RiskConsequence', sql.NVarChar, header.RiskConsequence || '')
      .input('ExistingCondition', sql.NVarChar, header.ExistingCondition || '')
      .input('PotentialImpact', sql.NVarChar, header.PotentialImpact || '')
      .input('Status', sql.NVarChar, header.Status || 'Open');

    await headerReq.query(`
      INSERT INTO dbo.RiskHeader (
        RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
        CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
        Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
      )
      VALUES (
        @RiskNo, @RiskTitle, @RiskDescription, @AssessmentDate, @ReviewDate, @AssessmentType, @RiskType,
        @CategoryID, @DepartmentID, @ProcessID, @LocationID, @BUID, @AssetID, @RiskOwnerID, @AssessorID, @ApproverID,
        @Threat, @Vulnerability, @RiskCause, @RiskConsequence, @ExistingCondition, @PotentialImpact, @Status
      )
    `);

    const idReq = new sql.Request(transaction);
    const idResult = await idReq
      .input('RiskNo', sql.NVarChar, riskNo)
      .query(`SELECT TOP 1 RiskID FROM dbo.Risk_Register WHERE RiskNo = @RiskNo ORDER BY RiskID DESC`);

    const riskId = idResult.recordset[0].RiskID;

    // 2. Insert Inherent Assessment
    if (inherentAssessment) {
      const l = parseInt(inherentAssessment.Likelihood || 3, 10);
      const i = parseInt(inherentAssessment.Impact || 3, 10);
      const score = l * i;
      const level = calcLevel(score);

      const inhReq = new sql.Request(transaction);
      inhReq
        .input('RiskID', sql.BigInt, riskId)
        .input('Likelihood', sql.Int, l)
        .input('Impact', sql.Int, i)
        .input('ConfidentialityImpact', sql.Int, inherentAssessment.ConfidentialityImpact || l)
        .input('IntegrityImpact', sql.Int, inherentAssessment.IntegrityImpact || l)
        .input('AvailabilityImpact', sql.Int, inherentAssessment.AvailabilityImpact || i)
        .input('QualityImpact', sql.Int, inherentAssessment.QualityImpact || i)
        .input('FinancialImpact', sql.Int, inherentAssessment.FinancialImpact || i)
        .input('RiskScore', sql.Int, score)
        .input('RiskLevel', sql.NVarChar, level);

      await inhReq.query(`
        INSERT INTO dbo.RiskAssessment (
          RiskID, AssessmentType, Likelihood, Impact,
          ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
          RiskScore, RiskLevel
        ) VALUES (
          @RiskID, 'INHERENT', @Likelihood, @Impact,
          @ConfidentialityImpact, @IntegrityImpact, @AvailabilityImpact, @QualityImpact, @FinancialImpact,
          @RiskScore, @RiskLevel
        )
      `);
    }

    // 3. Insert Residual Assessment
    if (residualAssessment) {
      const l = parseInt(residualAssessment.Likelihood || 2, 10);
      const i = parseInt(residualAssessment.Impact || 2, 10);
      const score = l * i;
      const level = calcLevel(score);

      const resReq = new sql.Request(transaction);
      resReq
        .input('RiskID', sql.BigInt, riskId)
        .input('Likelihood', sql.Int, l)
        .input('Impact', sql.Int, i)
        .input('ConfidentialityImpact', sql.Int, residualAssessment.ConfidentialityImpact || l)
        .input('IntegrityImpact', sql.Int, residualAssessment.IntegrityImpact || l)
        .input('AvailabilityImpact', sql.Int, residualAssessment.AvailabilityImpact || i)
        .input('QualityImpact', sql.Int, residualAssessment.QualityImpact || i)
        .input('FinancialImpact', sql.Int, residualAssessment.FinancialImpact || i)
        .input('RiskScore', sql.Int, score)
        .input('RiskLevel', sql.NVarChar, level);

      await resReq.query(`
        INSERT INTO dbo.RiskAssessment (
          RiskID, AssessmentType, Likelihood, Impact,
          ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
          RiskScore, RiskLevel
        ) VALUES (
          @RiskID, 'RESIDUAL', @Likelihood, @Impact,
          @ConfidentialityImpact, @IntegrityImpact, @AvailabilityImpact, @QualityImpact, @FinancialImpact,
          @RiskScore, @RiskLevel
        )
      `);
    }

    // 4. Insert Controls
    for (const ctrl of controls) {
      if (ctrl && ctrl.ControlName) {
        const ctrlReq = new sql.Request(transaction);
        ctrlReq
          .input('RiskID', sql.BigInt, riskId)
          .input('ControlName', sql.NVarChar, ctrl.ControlName)
          .input('ControlDescription', sql.NVarChar, ctrl.ControlDescription || '')
          .input('ControlType', sql.NVarChar, ctrl.ControlType || 'Preventive')
          .input('ManualOrAutomated', sql.NVarChar, ctrl.ManualOrAutomated || 'Automated')
          .input('ControlOwner', sql.NVarChar, ctrl.ControlOwner || '')
          .input('ControlEvidence', sql.NVarChar, ctrl.ControlEvidence || '')
          .input('ControlEffectiveness', sql.NVarChar, ctrl.ControlEffectiveness || 'Effective');

        await ctrlReq.query(`
          INSERT INTO dbo.RiskControl (
            RiskID, ControlName, ControlDescription, ControlType, ManualOrAutomated, ControlOwner, ControlEvidence, ControlEffectiveness
          ) VALUES (
            @RiskID, @ControlName, @ControlDescription, @ControlType, @ManualOrAutomated, @ControlOwner, @ControlEvidence, @ControlEffectiveness
          )
        `);
      }
    }

    // 5. Insert Standards Mapped
    for (const std of standards) {
      const sId = parseBigInt(std.StandardID);
      if (sId) {
        const stdReq = new sql.Request(transaction);
        stdReq
          .input('RiskID', sql.BigInt, riskId)
          .input('StandardID', sql.BigInt, sId)
          .input('ClauseID', sql.BigInt, parseBigInt(std.ClauseID))
          .input('ControlReference', sql.NVarChar, std.ControlReference || '')
          .input('ComplianceGap', sql.NVarChar, std.ComplianceGap || '');

        await stdReq.query(`
          INSERT INTO dbo.RiskStandardMapping (
            RiskID, StandardID, ClauseID, ControlReference, ComplianceGap
          ) VALUES (
            @RiskID, @StandardID, @ClauseID, @ControlReference, @ComplianceGap
          )
        `);
      }
    }

    // 6. Insert Treatment Actions
    for (const act of actions) {
      if (act && act.TreatmentAction) {
        const actReq = new sql.Request(transaction);
        actReq
          .input('RiskID', sql.BigInt, riskId)
          .input('TreatmentStrategy', sql.NVarChar, act.TreatmentStrategy || 'Reduce')
          .input('TreatmentAction', sql.NVarChar, act.TreatmentAction)
          .input('ActionOwner', sql.NVarChar, act.ActionOwner || '')
          .input('TargetDate', sql.Date, act.TargetDate && act.TargetDate !== '' ? act.TargetDate : null)
          .input('Priority', sql.NVarChar, act.Priority || 'Medium')
          .input('RequiredBudget', sql.Decimal(18, 2), act.RequiredBudget && !isNaN(parseFloat(act.RequiredBudget)) ? parseFloat(act.RequiredBudget) : 0)
          .input('ProgressPercent', sql.Int, act.ProgressPercent && !isNaN(parseInt(act.ProgressPercent, 10)) ? parseInt(act.ProgressPercent, 10) : 0)
          .input('Status', sql.NVarChar, act.Status || 'Open');

        await actReq.query(`
          INSERT INTO dbo.RiskTreatmentAction (
            RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority, RequiredBudget, ProgressPercent, Status
          ) VALUES (
            @RiskID, @TreatmentStrategy, @TreatmentAction, @ActionOwner, @TargetDate, @Priority, @RequiredBudget, @ProgressPercent, @Status
          )
        `);
      }
    }

    // 7. Insert Risk Acceptance
    if (acceptance && (acceptance.AcceptedBy || acceptance.IsRequired || acceptance.AcceptanceReason)) {
      const accReq = new sql.Request(transaction);
      accReq
        .input('RiskID', sql.BigInt, riskId)
        .input('IsRequired', sql.Bit, acceptance.IsRequired ? 1 : 0)
        .input('AcceptedBy', sql.NVarChar, acceptance.AcceptedBy || '')
        .input('AcceptanceDate', sql.Date, acceptance.AcceptanceDate && acceptance.AcceptanceDate !== '' ? acceptance.AcceptanceDate : new Date())
        .input('AcceptanceReason', sql.NVarChar, acceptance.AcceptanceReason || '');

      await accReq.query(`
        INSERT INTO dbo.RiskAcceptance (
          RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason
        ) VALUES (
          @RiskID, @IsRequired, @AcceptedBy, @AcceptanceDate, @AcceptanceReason
        )
      `);
    }

    // 8. Create Audit Log Entry
    await createAuditLog(transaction, 'SYSTEM', 'CREATE', 'RiskHeader', riskId, null, { RiskNo: riskNo, Title: header.RiskTitle });

    await transaction.commit();
    res.status(201).json({ message: 'Risk created successfully', riskID: riskId, riskNo });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating risk:', error);
    res.status(500).json({ message: 'Error creating risk', error: error.message });
  }
};

// 4. UPDATE EXISTING RISK (FULL 7-STEP RE-SAVE)
const updateRisk = async (req, res) => {
  const { id } = req.params;
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const {
      header = {},
      inherentAssessment = null,
      residualAssessment = null,
      controls = [],
      standards = [],
      actions = [],
      acceptance = null
    } = req.body;

    const riskId = parseBigInt(id);

    // 1. Update Header
    const headerReq = new sql.Request(transaction);
    headerReq
      .input('id', sql.BigInt, riskId)
      .input('RiskTitle', sql.NVarChar, header.RiskTitle || '')
      .input('RiskDescription', sql.NVarChar, header.RiskDescription || '')
      .input('CategoryID', sql.BigInt, parseBigInt(header.CategoryID))
      .input('DepartmentID', sql.BigInt, parseBigInt(header.DepartmentID))
      .input('ProcessID', sql.BigInt, parseBigInt(header.ProcessID))
      .input('LocationID', sql.BigInt, parseBigInt(header.LocationID))
      .input('BUID', sql.BigInt, parseBigInt(header.BUID))
      .input('AssetID', sql.BigInt, parseBigInt(header.AssetID))
      .input('RiskOwnerID', sql.BigInt, parseBigInt(header.RiskOwnerID))
      .input('AssessorID', sql.BigInt, parseBigInt(header.AssessorID))
      .input('ApproverID', sql.BigInt, parseBigInt(header.ApproverID))
      .input('Threat', sql.NVarChar, header.Threat || '')
      .input('Vulnerability', sql.NVarChar, header.Vulnerability || '')
      .input('RiskCause', sql.NVarChar, header.RiskCause || '')
      .input('RiskConsequence', sql.NVarChar, header.RiskConsequence || '')
      .input('ExistingCondition', sql.NVarChar, header.ExistingCondition || '')
      .input('PotentialImpact', sql.NVarChar, header.PotentialImpact || '')
      .input('Status', sql.NVarChar, header.Status || 'Open');

    await headerReq.query(`
      UPDATE dbo.RiskHeader SET
        RiskTitle = @RiskTitle,
        RiskDescription = @RiskDescription,
        CategoryID = @CategoryID,
        DepartmentID = @DepartmentID,
        ProcessID = @ProcessID,
        LocationID = @LocationID,
        BUID = @BUID,
        AssetID = @AssetID,
        RiskOwnerID = @RiskOwnerID,
        AssessorID = @AssessorID,
        ApproverID = @ApproverID,
        Threat = @Threat,
        Vulnerability = @Vulnerability,
        RiskCause = @RiskCause,
        RiskConsequence = @RiskConsequence,
        ExistingCondition = @ExistingCondition,
        PotentialImpact = @PotentialImpact,
        Status = @Status,
        UpdatedDate = GETDATE()
      WHERE RiskID = @id
    `);

    // 2. Update Inherent Assessment
    if (inherentAssessment) {
      const l = parseInt(inherentAssessment.Likelihood || 3, 10);
      const i = parseInt(inherentAssessment.Impact || 3, 10);
      const score = l * i;
      const level = calcLevel(score);

      const inhReq = new sql.Request(transaction);
      inhReq
        .input('RiskID', sql.BigInt, riskId)
        .input('Likelihood', sql.Int, l)
        .input('Impact', sql.Int, i)
        .input('ConfidentialityImpact', sql.Int, inherentAssessment.ConfidentialityImpact || l)
        .input('IntegrityImpact', sql.Int, inherentAssessment.IntegrityImpact || l)
        .input('AvailabilityImpact', sql.Int, inherentAssessment.AvailabilityImpact || i)
        .input('QualityImpact', sql.Int, inherentAssessment.QualityImpact || i)
        .input('FinancialImpact', sql.Int, inherentAssessment.FinancialImpact || i)
        .input('RiskScore', sql.Int, score)
        .input('RiskLevel', sql.NVarChar, level);

      await inhReq.query(`
        IF EXISTS (SELECT 1 FROM dbo.Risk_Assessment WHERE RiskID = @RiskID AND AssessmentType = 'INHERENT')
          UPDATE dbo.Risk_Assessment SET
            LikelihoodScore = @Likelihood, ImpactScore = @Impact,
            ConfidentialityImpact = @ConfidentialityImpact, IntegrityImpact = @IntegrityImpact,
            AvailabilityImpact = @AvailabilityImpact, QualityImpact = @QualityImpact, FinancialImpact = @FinancialImpact,
            RiskScore = @RiskScore, RiskLevel = @RiskLevel, UpdatedDate = GETDATE()
          WHERE RiskID = @RiskID AND AssessmentType = 'INHERENT'
        ELSE
          INSERT INTO dbo.RiskAssessment (RiskID, AssessmentType, Likelihood, Impact, ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact, RiskScore, RiskLevel)
          VALUES (@RiskID, 'INHERENT', @Likelihood, @Impact, @ConfidentialityImpact, @IntegrityImpact, @AvailabilityImpact, @QualityImpact, @FinancialImpact, @RiskScore, @RiskLevel)
      `);
    }

    // 3. Update Residual Assessment
    if (residualAssessment) {
      const l = parseInt(residualAssessment.Likelihood || 2, 10);
      const i = parseInt(residualAssessment.Impact || 2, 10);
      const score = l * i;
      const level = calcLevel(score);

      const resReq = new sql.Request(transaction);
      resReq
        .input('RiskID', sql.BigInt, riskId)
        .input('Likelihood', sql.Int, l)
        .input('Impact', sql.Int, i)
        .input('ConfidentialityImpact', sql.Int, residualAssessment.ConfidentialityImpact || l)
        .input('IntegrityImpact', sql.Int, residualAssessment.IntegrityImpact || l)
        .input('AvailabilityImpact', sql.Int, residualAssessment.AvailabilityImpact || i)
        .input('QualityImpact', sql.Int, residualAssessment.QualityImpact || i)
        .input('FinancialImpact', sql.Int, residualAssessment.FinancialImpact || i)
        .input('RiskScore', sql.Int, score)
        .input('RiskLevel', sql.NVarChar, level);

      await resReq.query(`
        IF EXISTS (SELECT 1 FROM dbo.Risk_Assessment WHERE RiskID = @RiskID AND AssessmentType = 'RESIDUAL')
          UPDATE dbo.Risk_Assessment SET
            LikelihoodScore = @Likelihood, ImpactScore = @Impact,
            ConfidentialityImpact = @ConfidentialityImpact, IntegrityImpact = @IntegrityImpact,
            AvailabilityImpact = @AvailabilityImpact, QualityImpact = @QualityImpact, FinancialImpact = @FinancialImpact,
            RiskScore = @RiskScore, RiskLevel = @RiskLevel, UpdatedDate = GETDATE()
          WHERE RiskID = @RiskID AND AssessmentType = 'RESIDUAL'
        ELSE
          INSERT INTO dbo.RiskAssessment (RiskID, AssessmentType, Likelihood, Impact, ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact, RiskScore, RiskLevel)
          VALUES (@RiskID, 'RESIDUAL', @Likelihood, @Impact, @ConfidentialityImpact, @IntegrityImpact, @AvailabilityImpact, @QualityImpact, @FinancialImpact, @RiskScore, @RiskLevel)
      `);
    }

    // 4. Update Controls (Delete & Re-insert)
    await new sql.Request(transaction).input('RiskID', sql.BigInt, riskId).query(`DELETE FROM dbo.Risk_Control WHERE RiskID = @RiskID`);
    for (const ctrl of controls) {
      if (ctrl && ctrl.ControlName) {
        const ctrlReq = new sql.Request(transaction);
        ctrlReq
          .input('RiskID', sql.BigInt, riskId)
          .input('ControlName', sql.NVarChar, ctrl.ControlName)
          .input('ControlDescription', sql.NVarChar, ctrl.ControlDescription || '')
          .input('ControlType', sql.NVarChar, ctrl.ControlType || 'Preventive')
          .input('ManualOrAutomated', sql.NVarChar, ctrl.ManualOrAutomated || 'Automated')
          .input('ControlOwner', sql.NVarChar, ctrl.ControlOwner || '')
          .input('ControlEvidence', sql.NVarChar, ctrl.ControlEvidence || '')
          .input('ControlEffectiveness', sql.NVarChar, ctrl.ControlEffectiveness || 'Effective');

        await ctrlReq.query(`
          INSERT INTO dbo.RiskControl (
            RiskID, ControlName, ControlDescription, ControlType, ManualOrAutomated, ControlOwner, ControlEvidence, ControlEffectiveness
          ) VALUES (
            @RiskID, @ControlName, @ControlDescription, @ControlType, @ManualOrAutomated, @ControlOwner, @ControlEvidence, @ControlEffectiveness
          )
        `);
      }
    }

    // 5. Update Standards Mapped (Delete & Re-insert)
    await new sql.Request(transaction).input('RiskID', sql.BigInt, riskId).query(`DELETE FROM dbo.Risk_Standard WHERE RiskID = @RiskID`);
    for (const std of standards) {
      const sId = parseBigInt(std.StandardID);
      if (sId) {
        const stdReq = new sql.Request(transaction);
        stdReq
          .input('RiskID', sql.BigInt, riskId)
          .input('StandardID', sql.BigInt, sId)
          .input('ClauseID', sql.BigInt, parseBigInt(std.ClauseID))
          .input('ControlReference', sql.NVarChar, std.ControlReference || '')
          .input('ComplianceGap', sql.NVarChar, std.ComplianceGap || '');

        await stdReq.query(`
          INSERT INTO dbo.RiskStandardMapping (
            RiskID, StandardID, ClauseID, ControlReference, ComplianceGap
          ) VALUES (
            @RiskID, @StandardID, @ClauseID, @ControlReference, @ComplianceGap
          )
        `);
      }
    }

    // 6. Update Treatment Actions (Delete & Re-insert)
    await new sql.Request(transaction).input('RiskID', sql.BigInt, riskId).query(`DELETE FROM dbo.Risk_Action WHERE RiskID = @RiskID`);
    for (const act of actions) {
      if (act && act.TreatmentAction) {
        const actReq = new sql.Request(transaction);
        actReq
          .input('RiskID', sql.BigInt, riskId)
          .input('TreatmentStrategy', sql.NVarChar, act.TreatmentStrategy || 'Reduce')
          .input('TreatmentAction', sql.NVarChar, act.TreatmentAction)
          .input('ActionOwner', sql.NVarChar, act.ActionOwner || '')
          .input('TargetDate', sql.Date, act.TargetDate && act.TargetDate !== '' ? act.TargetDate : null)
          .input('Priority', sql.NVarChar, act.Priority || 'Medium')
          .input('RequiredBudget', sql.Decimal(18, 2), act.RequiredBudget && !isNaN(parseFloat(act.RequiredBudget)) ? parseFloat(act.RequiredBudget) : 0)
          .input('ProgressPercent', sql.Int, act.ProgressPercent && !isNaN(parseInt(act.ProgressPercent, 10)) ? parseInt(act.ProgressPercent, 10) : 0)
          .input('Status', sql.NVarChar, act.Status || 'Open');

        await actReq.query(`
          INSERT INTO dbo.RiskTreatmentAction (
            RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority, RequiredBudget, ProgressPercent, Status
          ) VALUES (
            @RiskID, @TreatmentStrategy, @TreatmentAction, @ActionOwner, @TargetDate, @Priority, @RequiredBudget, @ProgressPercent, @Status
          )
        `);
      }
    }

    // 7. Update Acceptance
    if (acceptance && (acceptance.AcceptedBy || acceptance.IsRequired || acceptance.AcceptanceReason)) {
      await new sql.Request(transaction).input('RiskID', sql.BigInt, riskId).query(`DELETE FROM dbo.Risk_Acceptance WHERE RiskID = @RiskID`);
      const accReq = new sql.Request(transaction);
      accReq
        .input('RiskID', sql.BigInt, riskId)
        .input('IsRequired', sql.Bit, acceptance.IsRequired ? 1 : 0)
        .input('AcceptedBy', sql.NVarChar, acceptance.AcceptedBy || '')
        .input('AcceptanceDate', sql.Date, acceptance.AcceptanceDate && acceptance.AcceptanceDate !== '' ? acceptance.AcceptanceDate : new Date())
        .input('AcceptanceReason', sql.NVarChar, acceptance.AcceptanceReason || '');

      await accReq.query(`
        INSERT INTO dbo.RiskAcceptance (
          RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason
        ) VALUES (
          @RiskID, @IsRequired, @AcceptedBy, @AcceptanceDate, @AcceptanceReason
        )
      `);
    }

    // 8. Create Audit Log
    await createAuditLog(transaction, 'SYSTEM', 'UPDATE', 'RiskHeader', riskId, null, { RiskTitle: header.RiskTitle });

    await transaction.commit();
    res.json({ message: 'Risk updated successfully' });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating risk:', error);
    res.status(500).json({ message: 'Error updating risk', error: error.message });
  }
};

// 5. DELETE RISK
const deleteRisk = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query(`UPDATE dbo.RiskHeader SET IsActive = 0, UpdatedDate = GETDATE() WHERE RiskID = @id`);

    await createAuditLog(null, 'SYSTEM', 'DELETE', 'RiskHeader', id, null, { Status: 'Soft Deleted' });
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({ message: 'Error deleting risk', error: error.message });
  }
};

module.exports = {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
};
