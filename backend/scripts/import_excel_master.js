const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('../src/config/db');

/**
 * Excel Master Data & Risk Importer Script
 * Usage:
 *   node scripts/import_excel_master.js [path_to_excel_file]
 * 
 * Reads worksheets:
 *   - BusinessUnits
 *   - Departments
 *   - Users
 *   - Locations
 *   - Processes
 *   - Assets
 *   - Categories
 *   - Standards
 *   - Risks
 */
async function importExcelMasterData() {
  const filePath = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.join(__dirname, '../../database/Master_Data_Template.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Excel file not found: ${filePath}`);
    console.log(`💡 Tip: Run "node scripts/generate_excel_template.js" first to create a sample template.`);
    process.exit(1);
  }

  console.log(`📊 Opening Excel workbook: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const pool = await connectDB();

  try {
    // 1. BusinessUnits
    if (workbook.Sheets['BusinessUnits']) {
      const buRows = XLSX.utils.sheet_to_json(workbook.Sheets['BusinessUnits']);
      console.log(`📦 Processing ${buRows.length} Business Units...`);
      for (const row of buRows) {
        if (!row.BUCode || !row.BUName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_BusinessUnit WHERE BUCode = '${row.BUCode.replace(/'/g, "''")}')
          BEGIN
            INSERT INTO dbo.Master_BusinessUnit (BUCode, BUName, Description, IsActive)
            VALUES (N'${row.BUCode.replace(/'/g, "''")}', N'${row.BUName.replace(/'/g, "''")}', N'${(row.Description || '').replace(/'/g, "''")}', 1);
          END;
        `);
      }
      console.log(`  ✅ Business Units processed.`);
    }

    // 2. Departments
    if (workbook.Sheets['Departments']) {
      const deptRows = XLSX.utils.sheet_to_json(workbook.Sheets['Departments']);
      console.log(`🏢 Processing ${deptRows.length} Departments...`);
      for (const row of deptRows) {
        if (!row.DepartmentCode || !row.DepartmentName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Department WHERE DepartmentCode = '${row.DepartmentCode.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Departments processed.`);
    }

    // 3. Users
    if (workbook.Sheets['Users']) {
      const userRows = XLSX.utils.sheet_to_json(workbook.Sheets['Users']);
      console.log(`👤 Processing ${userRows.length} Users...`);
      for (const row of userRows) {
        if (!row.Username || !row.FullName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Username = '${row.Username.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Users processed.`);
    }

    // 4. Locations
    if (workbook.Sheets['Locations']) {
      const locRows = XLSX.utils.sheet_to_json(workbook.Sheets['Locations']);
      console.log(`📍 Processing ${locRows.length} Locations...`);
      for (const row of locRows) {
        if (!row.LocationCode || !row.LocationName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Location WHERE LocationCode = '${row.LocationCode.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Locations processed.`);
    }

    // 5. Processes
    if (workbook.Sheets['Processes']) {
      const procRows = XLSX.utils.sheet_to_json(workbook.Sheets['Processes']);
      console.log(`⚙️ Processing ${procRows.length} Processes...`);
      for (const row of procRows) {
        if (!row.ProcessCode || !row.ProcessName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Process WHERE ProcessCode = '${row.ProcessCode.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Processes processed.`);
    }

    // 6. Assets
    if (workbook.Sheets['Assets']) {
      const assetRows = XLSX.utils.sheet_to_json(workbook.Sheets['Assets']);
      console.log(`🖥️ Processing ${assetRows.length} Assets...`);
      for (const row of assetRows) {
        if (!row.AssetCode || !row.AssetName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Asset WHERE AssetCode = '${row.AssetCode.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Assets processed.`);
    }

    // 7. Categories
    if (workbook.Sheets['Categories']) {
      const catRows = XLSX.utils.sheet_to_json(workbook.Sheets['Categories']);
      console.log(`🏷️ Processing ${catRows.length} Risk Categories...`);
      for (const row of catRows) {
        if (!row.CategoryCode || !row.CategoryName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_RiskCategory WHERE CategoryCode = '${row.CategoryCode.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Categories processed.`);
    }

    // 8. Standards
    if (workbook.Sheets['Standards']) {
      const stdRows = XLSX.utils.sheet_to_json(workbook.Sheets['Standards']);
      console.log(`📜 Processing ${stdRows.length} Standards & Clauses...`);
      for (const row of stdRows) {
        if (!row.StandardCode || !row.StandardName) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Master_Standard WHERE StandardCode = '${row.StandardCode.replace(/'/g, "''")}')
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
            IF NOT EXISTS (SELECT 1 FROM dbo.Master_StandardClause WHERE ClauseNo = '${row.ClauseNo.replace(/'/g, "''")}' AND StandardID = (SELECT TOP 1 StandardID FROM dbo.Master_Standard WHERE StandardCode = '${row.StandardCode.replace(/'/g, "''")}'))
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
      }
      console.log(`  ✅ Standards & Clauses processed.`);
    }

    // 9. Risks
    if (workbook.Sheets['Risks']) {
      const riskRows = XLSX.utils.sheet_to_json(workbook.Sheets['Risks']);
      console.log(`🚨 Processing ${riskRows.length} Risks...`);
      for (const row of riskRows) {
        if (!row.RiskNo || !row.RiskTitle) continue;
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.RiskHeader WHERE RiskNo = '${row.RiskNo.replace(/'/g, "''")}')
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
      }
      console.log(`  ✅ Risks processed.`);
    }

    console.log(`🎉 All Excel Master Data & Risks imported successfully!`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error importing Excel data:`, err.message);
    process.exit(1);
  }
}

importExcelMasterData();
