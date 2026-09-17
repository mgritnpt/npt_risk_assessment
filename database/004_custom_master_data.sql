/* ============================================================================
   ENTERPRISE RISK MANAGEMENT DATABASE
   CUSTOM MASTER DATA & RISK REGISTER IMPORT TEMPLATE
   ============================================================================
   Usage:
     Use this SQL script to manually add or import custom Master Data and Risks
     into the IT_Apps database. All statements use IF NOT EXISTS checks to prevent
     duplicate key errors when re-executing.
   ============================================================================ */

USE [IT_Apps];
GO

-- ============================================================================
-- 1. BUSINESS UNITS (Master_BusinessUnit)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_BusinessUnit WHERE BUCode = 'BU-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_BusinessUnit (BUCode, BUName, Description, IsActive)
    VALUES ('BU-CUSTOM-01', N'แผนกธุรกิจตัวอย่าง (Custom BU 1)', N'คำอธิบายเพิ่มเติมเกี่ยวกับ Business Unit', 1);
END;
GO

-- ============================================================================
-- 2. DEPARTMENTS (Master_Department)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_Department WHERE DepartmentCode = 'DEPT-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_Department (DepartmentCode, DepartmentName, BUID, ManagerName, Description, IsActive)
    VALUES (
        'DEPT-CUSTOM-01', 
        N'ฝ่ายวิจัยและพัฒนา (R&D Department)', 
        (SELECT TOP 1 BUID FROM dbo.Master_BusinessUnit WHERE BUCode = 'BU-CUSTOM-01'), 
        N'คุณสมศักดิ์ วิจัย', 
        N'ฝ่ายวิเคราะห์สูตรและนวัตกรรมใหม่', 
        1
    );
END;
GO

-- ============================================================================
-- 3. USERS (User)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Username = 'user.custom01')
BEGIN
    INSERT INTO dbo.[User] (Username, FullName, Email, Role, DepartmentID, IsActive)
    VALUES (
        'user.custom01', 
        N'สมศักดิ์ วิจัย (R&D Lead)', 
        'somsak.r@paint-coatings.co.th', 
        'Risk Owner', 
        (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = 'DEPT-CUSTOM-01'), 
        1
    );
END;
GO

-- ============================================================================
-- 4. LOCATIONS (Master_Location)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_Location WHERE LocationCode = 'LOC-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_Location (LocationCode, LocationName, Description, IsActive)
    VALUES ('LOC-CUSTOM-01', N'ศูนย์ R&D บางปู (Bangpoo R&D Center)', N'ศูนย์วิจัยเคมีภัณฑ์และทดสอบสีพ่น', 1);
END;
GO

-- ============================================================================
-- 5. PROCESSES (Master_Process)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_Process WHERE ProcessCode = 'PROC-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_Process (ProcessCode, ProcessName, DepartmentID, Description, IsCritical, IsActive)
    VALUES (
        'PROC-CUSTOM-01', 
        N'R&D New Formulation Test Process', 
        (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = 'DEPT-CUSTOM-01'), 
        N'กระบวนการทดสอบและพัฒนาสูตรสีใหม่', 
        1, 
        1
    );
END;
GO

-- ============================================================================
-- 6. ASSETS (Master_Asset)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_Asset WHERE AssetCode = 'AST-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_Asset (AssetCode, AssetName, AssetType, OwnerDepartmentID, LocationID, OwnerName, Criticality, IsActive)
    VALUES (
        'AST-CUSTOM-01', 
        N'R&D Spectrophotometer & Color Analysis Station', 
        N'Lab Test Appliance', 
        (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = 'DEPT-CUSTOM-01'), 
        (SELECT TOP 1 LocationID FROM dbo.Master_Location WHERE LocationCode = 'LOC-CUSTOM-01'), 
        N'สมศักดิ์ วิจัย', 
        N'High', 
        1
    );
END;
GO

-- ============================================================================
-- 7. RISK CATEGORIES (Master_RiskCategory)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_RiskCategory WHERE CategoryCode = 'CAT-CUSTOM-01')
BEGIN
    INSERT INTO dbo.Master_RiskCategory (CategoryCode, CategoryName, Description, IsActive)
    VALUES ('CAT-CUSTOM-01', N'R&D & Intellectual Property', N'ความเสี่ยงด้านการวิจัยพัฒนา และทรัพย์สินทางปัญญา', 1);
END;
GO

-- ============================================================================
-- 8. STANDARDS & CLAUSES (Master_Standard & Master_StandardClause)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Master_Standard WHERE StandardCode = 'ISO56002')
BEGIN
    INSERT INTO dbo.Master_Standard (StandardCode, StandardName, Description, IsActive)
    VALUES ('ISO56002', N'ISO 56002:2019 (Innovation Management)', N'ระบบการจัดการนวัตกรรมและ R&D', 1);

    INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
    VALUES (
        (SELECT TOP 1 StandardID FROM dbo.Master_Standard WHERE StandardCode = 'ISO56002'),
        '6.1', 
        N'Actions to address opportunities and risks in Innovation', 
        N'การประเมินความเสี่ยงและโอกาสในการพัฒนานวัตกรรมใหม่'
    );
END;
GO

-- ============================================================================
-- 9. CUSTOM RISK REGISTER ENTRY (via Compatibility View dbo.RiskHeader)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.RiskHeader WHERE RiskNo = 'IT-R-2026-999')
BEGIN
    INSERT INTO dbo.RiskHeader (
        RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
        CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
        Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
    ) VALUES (
        'IT-R-2026-999', 
        N'Loss of R&D Color Formulation Data due to Lab Workstation Failure', 
        N'ความเสี่ยงจากการสูญเสียข้อมูลผลการทดสอบสูตรสีเนื่องจากเครื่องคอมพิวเตอร์ในห้องปฏิบัติการ R&D เกิดฮาร์ดดิสก์เสีย',
        GETDATE(), DATEADD(month, 6, GETDATE()), 'Initial', 'IT Risk',
        (SELECT TOP 1 CategoryID FROM dbo.Master_RiskCategory WHERE CategoryCode = 'CAT-CUSTOM-01'),
        (SELECT TOP 1 DepartmentID FROM dbo.Master_Department WHERE DepartmentCode = 'DEPT-CUSTOM-01'),
        (SELECT TOP 1 ProcessID FROM dbo.Master_Process WHERE ProcessCode = 'PROC-CUSTOM-01'),
        (SELECT TOP 1 LocationID FROM dbo.Master_Location WHERE LocationCode = 'LOC-CUSTOM-01'),
        (SELECT TOP 1 BUID FROM dbo.Master_BusinessUnit WHERE BUCode = 'BU-CUSTOM-01'),
        (SELECT TOP 1 AssetID FROM dbo.Master_Asset WHERE AssetCode = 'AST-CUSTOM-01'),
        (SELECT TOP 1 UserID FROM dbo.[User] WHERE Username = 'user.custom01'),
        (SELECT TOP 1 UserID FROM dbo.[User] WHERE Username = 'user.custom01'),
        (SELECT TOP 1 UserID FROM dbo.[User] WHERE Username = 'it.mgr'),
        N'Hardware Failure, Disk Corruption',
        N'ไม่มีระบบ Auto-backup ข้อมูลแล็บไปยัง Cloud หรือ Central Server',
        N'การใช้งานเครื่องคอมพิวเตอร์เก่าในห้องแล็บที่ผ่านการทดสอบสารเคมี',
        N'ผลทดสอบสูตรสีที่ใช้เวลาทดลอง 3 เดือนสูญหาย ต้องเริ่มทำการทดสอบใหม่',
        N'มีการกด Back up ด้วยตนเองลงแฟลชไดรฟ์เดือนละ 1 ครั้ง',
        N'สูญเสียเวลาและค่าสารเคมีทดลอง มูลค่ากว่า 300,000 บาท',
        'Open'
    );
END;
GO

PRINT '✅ Custom Master Data and Risk items imported successfully!';
GO
