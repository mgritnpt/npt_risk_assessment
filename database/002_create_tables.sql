USE IT_Apps;
GO

-- ============================================================================
-- DROP ALL FOREIGN KEY CONSTRAINTS FIRST TO ENSURE CLEAN WIPE
-- ============================================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) 
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;

EXEC sp_executesql @sql;
GO

-- ============================================================================
-- DROP EXISTING TABLES
-- ============================================================================
IF OBJECT_ID('dbo.AuditLog', 'U') IS NOT NULL DROP TABLE dbo.AuditLog;
IF OBJECT_ID('dbo.RiskAcceptance', 'U') IS NOT NULL DROP TABLE dbo.RiskAcceptance;
IF OBJECT_ID('dbo.RiskTreatmentAction', 'U') IS NOT NULL DROP TABLE dbo.RiskTreatmentAction;
IF OBJECT_ID('dbo.RiskStandardMapping', 'U') IS NOT NULL DROP TABLE dbo.RiskStandardMapping;
IF OBJECT_ID('dbo.RiskControl', 'U') IS NOT NULL DROP TABLE dbo.RiskControl;
IF OBJECT_ID('dbo.RiskAssessment', 'U') IS NOT NULL DROP TABLE dbo.RiskAssessment;
IF OBJECT_ID('dbo.RiskHeader', 'U') IS NOT NULL DROP TABLE dbo.RiskHeader;
IF OBJECT_ID('dbo.Risk', 'U') IS NOT NULL DROP TABLE dbo.Risk;
IF OBJECT_ID('dbo.Master_ImpactCriteria', 'U') IS NOT NULL DROP TABLE dbo.Master_ImpactCriteria;
IF OBJECT_ID('dbo.Master_LikelihoodCriteria', 'U') IS NOT NULL DROP TABLE dbo.Master_LikelihoodCriteria;
IF OBJECT_ID('dbo.Master_BusinessUnit', 'U') IS NOT NULL DROP TABLE dbo.Master_BusinessUnit;
IF OBJECT_ID('dbo.Master_Location', 'U') IS NOT NULL DROP TABLE dbo.Master_Location;
IF OBJECT_ID('dbo.Master_Asset', 'U') IS NOT NULL DROP TABLE dbo.Master_Asset;
IF OBJECT_ID('dbo.Master_Process', 'U') IS NOT NULL DROP TABLE dbo.Master_Process;
IF OBJECT_ID('dbo.Master_Department', 'U') IS NOT NULL DROP TABLE dbo.Master_Department;
IF OBJECT_ID('dbo.Master_RiskCategory', 'U') IS NOT NULL DROP TABLE dbo.Master_RiskCategory;
IF OBJECT_ID('dbo.Master_StandardClause', 'U') IS NOT NULL DROP TABLE dbo.Master_StandardClause;
IF OBJECT_ID('dbo.Master_Standard', 'U') IS NOT NULL DROP TABLE dbo.Master_Standard;
IF OBJECT_ID('dbo.ImpactCriteria', 'U') IS NOT NULL DROP TABLE dbo.ImpactCriteria;
IF OBJECT_ID('dbo.LikelihoodCriteria', 'U') IS NOT NULL DROP TABLE dbo.LikelihoodCriteria;
IF OBJECT_ID('dbo.BusinessUnit', 'U') IS NOT NULL DROP TABLE dbo.BusinessUnit;
IF OBJECT_ID('dbo.Location', 'U') IS NOT NULL DROP TABLE dbo.Location;
IF OBJECT_ID('dbo.Asset', 'U') IS NOT NULL DROP TABLE dbo.Asset;
IF OBJECT_ID('dbo.Process', 'U') IS NOT NULL DROP TABLE dbo.Process;
IF OBJECT_ID('dbo.Department', 'U') IS NOT NULL DROP TABLE dbo.Department;
IF OBJECT_ID('dbo.RiskCategory', 'U') IS NOT NULL DROP TABLE dbo.RiskCategory;
IF OBJECT_ID('dbo.StandardClause', 'U') IS NOT NULL DROP TABLE dbo.StandardClause;
IF OBJECT_ID('dbo.Standard', 'U') IS NOT NULL DROP TABLE dbo.Standard;
IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL DROP TABLE dbo.[User];
IF OBJECT_ID('dbo.User', 'U') IS NOT NULL DROP TABLE dbo.[User];
GO

-- ============================================================================
-- 1. USER TABLE
-- ============================================================================
CREATE TABLE dbo.[User] (
    UserID BIGINT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'User',
    DepartmentID BIGINT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);
CREATE UNIQUE INDEX IX_User_RowPointer ON dbo.[User](RowPointer);

-- ============================================================================
-- 2. MASTER STANDARDS & CLAUSES
-- ============================================================================
CREATE TABLE dbo.Master_Standard (
    StandardID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StandardCode NVARCHAR(50) NOT NULL UNIQUE,
    StandardName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);
CREATE UNIQUE INDEX IX_MasterStandard_RowPointer ON dbo.Master_Standard(RowPointer);

CREATE TABLE dbo.Master_StandardClause (
    ClauseID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StandardID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.Master_Standard(StandardID),
    ClauseNo NVARCHAR(50) NOT NULL,
    ClauseTitle NVARCHAR(250) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);
CREATE UNIQUE INDEX IX_MasterStandardClause_RowPointer ON dbo.Master_StandardClause(RowPointer);

-- ============================================================================
-- 3. MASTER RISK CATEGORIES
-- ============================================================================
CREATE TABLE dbo.Master_RiskCategory (
    CategoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode NVARCHAR(50) NOT NULL UNIQUE,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 4. MASTER ORGANIZATION STRUCTURE
-- ============================================================================
CREATE TABLE dbo.Master_Department (
    DepartmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(100) NOT NULL,
    ManagerName NVARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

CREATE TABLE dbo.Master_Process (
    ProcessID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProcessCode NVARCHAR(50) NOT NULL UNIQUE,
    ProcessName NVARCHAR(100) NOT NULL,
    DepartmentID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_Department(DepartmentID),
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

CREATE TABLE dbo.Master_Asset (
    AssetID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AssetCode NVARCHAR(50) NOT NULL UNIQUE,
    AssetName NVARCHAR(100) NOT NULL,
    AssetType NVARCHAR(50) NULL,
    OwnerName NVARCHAR(100) NULL,
    Criticality NVARCHAR(50) NULL DEFAULT 'High',
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

CREATE TABLE dbo.Master_Location (
    LocationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LocationCode NVARCHAR(50) NOT NULL UNIQUE,
    LocationName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

CREATE TABLE dbo.Master_BusinessUnit (
    BUID BIGINT IDENTITY(1,1) PRIMARY KEY,
    BUCode NVARCHAR(50) NOT NULL UNIQUE,
    BUName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 5. MASTER RISK EVALUATION CRITERIA (Likelihood L1-L5 & Impact I1-I5)
-- ============================================================================
CREATE TABLE dbo.Master_LikelihoodCriteria (
    LikelihoodID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LikelihoodScore INT NOT NULL UNIQUE,
    LevelName NVARCHAR(50) NOT NULL,
    LevelNameTH NVARCHAR(50) NOT NULL,
    Definition NVARCHAR(MAX) NOT NULL,
    FrequencyDescription NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

CREATE TABLE dbo.Master_ImpactCriteria (
    ImpactID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ImpactScore INT NOT NULL,
    ImpactCategory NVARCHAR(50) NOT NULL,
    LevelName NVARCHAR(50) NOT NULL,
    LevelNameTH NVARCHAR(50) NOT NULL,
    Definition NVARCHAR(MAX) NOT NULL,
    FinancialThreshold NVARCHAR(100) NULL,
    OperationalImpact NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 6. RISK HEADER TABLE
-- ============================================================================
CREATE TABLE dbo.RiskHeader (
    RiskID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskNo NVARCHAR(50) NOT NULL UNIQUE,
    RiskTitle NVARCHAR(250) NOT NULL,
    RiskDescription NVARCHAR(MAX) NULL,
    AssessmentDate DATE NOT NULL DEFAULT GETDATE(),
    ReviewDate DATE NULL,
    AssessmentType NVARCHAR(50) NOT NULL DEFAULT 'Initial',
    RiskType NVARCHAR(50) NOT NULL DEFAULT 'IT Risk',
    CategoryID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.Master_RiskCategory(CategoryID),
    DepartmentID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.Master_Department(DepartmentID),
    ProcessID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_Process(ProcessID),
    LocationID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_Location(LocationID),
    BUID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_BusinessUnit(BUID),
    AssetID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_Asset(AssetID),
    RiskOwnerID BIGINT NULL FOREIGN KEY REFERENCES dbo.[User](UserID),
    AssessorID BIGINT NULL FOREIGN KEY REFERENCES dbo.[User](UserID),
    ApproverID BIGINT NULL FOREIGN KEY REFERENCES dbo.[User](UserID),
    Threat NVARCHAR(MAX) NULL,
    Vulnerability NVARCHAR(MAX) NULL,
    RiskCause NVARCHAR(MAX) NULL,
    RiskConsequence NVARCHAR(MAX) NULL,
    ExistingCondition NVARCHAR(MAX) NULL,
    PotentialImpact NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);
CREATE UNIQUE INDEX IX_RiskHeader_RowPointer ON dbo.RiskHeader(RowPointer);

-- ============================================================================
-- 7. RISK ASSESSMENT TABLE
-- ============================================================================
CREATE TABLE dbo.RiskAssessment (
    AssessmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.RiskHeader(RiskID) ON DELETE CASCADE,
    AssessmentType NVARCHAR(20) NOT NULL,
    Likelihood INT NOT NULL,
    Impact INT NOT NULL,
    ConfidentialityImpact INT NULL,
    IntegrityImpact INT NULL,
    AvailabilityImpact INT NULL,
    BusinessImpact INT NULL,
    QualityImpact INT NULL,
    FinancialImpact INT NULL,
    OperationalImpact INT NULL,
    CustomerImpact INT NULL,
    SafetyImpact INT NULL,
    RiskScore INT NOT NULL,
    RiskLevel NVARCHAR(20) NOT NULL,
    AssessmentDate DATE NOT NULL DEFAULT GETDATE(),
    AssessorID BIGINT NULL FOREIGN KEY REFERENCES dbo.[User](UserID),
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 8. RISK CONTROLS TABLE
-- ============================================================================
CREATE TABLE dbo.RiskControl (
    ControlID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.RiskHeader(RiskID) ON DELETE CASCADE,
    ControlName NVARCHAR(250) NOT NULL,
    ControlDescription NVARCHAR(MAX) NULL,
    ControlType NVARCHAR(50) NOT NULL DEFAULT 'Preventive',
    ManualOrAutomated NVARCHAR(50) NOT NULL DEFAULT 'Automated',
    ControlOwner NVARCHAR(100) NULL,
    Frequency NVARCHAR(50) NULL DEFAULT 'Daily',
    ControlEvidence NVARCHAR(MAX) NULL,
    EvidenceLocation NVARCHAR(MAX) NULL,
    ControlEffectiveness NVARCHAR(50) NOT NULL DEFAULT 'Effective',
    LastTestDate DATE NULL,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 9. RISK STANDARD MAPPING TABLE
-- ============================================================================
CREATE TABLE dbo.RiskStandardMapping (
    MappingID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.RiskHeader(RiskID) ON DELETE CASCADE,
    StandardID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.Master_Standard(StandardID),
    ClauseID BIGINT NULL FOREIGN KEY REFERENCES dbo.Master_StandardClause(ClauseID),
    ControlReference NVARCHAR(250) NULL,
    ComplianceGap NVARCHAR(MAX) NULL,
    EvidenceReference NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Compliant',
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 10. RISK TREATMENT & ACTION PLAN TABLE
-- ============================================================================
CREATE TABLE dbo.RiskTreatmentAction (
    ActionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.RiskHeader(RiskID) ON DELETE CASCADE,
    TreatmentStrategy NVARCHAR(50) NOT NULL DEFAULT 'Reduce',
    TreatmentAction NVARCHAR(MAX) NOT NULL,
    ActionOwner NVARCHAR(100) NULL,
    TargetDate DATE NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium',
    RequiredBudget DECIMAL(18,2) NULL DEFAULT 0.00,
    RequiredResource NVARCHAR(MAX) NULL,
    ExpectedResult NVARCHAR(MAX) NULL,
    ProgressPercent INT NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 11. RISK ACCEPTANCE TABLE
-- ============================================================================
CREATE TABLE dbo.RiskAcceptance (
    AcceptanceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.RiskHeader(RiskID) ON DELETE CASCADE,
    IsRequired BIT NOT NULL DEFAULT 0,
    AcceptedBy NVARCHAR(100) NULL,
    AcceptanceDate DATE NULL,
    AcceptanceReason NVARCHAR(MAX) NULL,
    ExpiryDate DATE NULL,
    ReviewFrequency NVARCHAR(50) NULL DEFAULT 'Annual',
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);

-- ============================================================================
-- 12. AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE dbo.AuditLog (
    LogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID NVARCHAR(50) NULL DEFAULT 'SYSTEM',
    Action NVARCHAR(50) NOT NULL,
    TableName NVARCHAR(100) NOT NULL,
    RecordID NVARCHAR(100) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    IPAddress NVARCHAR(50) NULL DEFAULT '127.0.0.1',
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO
