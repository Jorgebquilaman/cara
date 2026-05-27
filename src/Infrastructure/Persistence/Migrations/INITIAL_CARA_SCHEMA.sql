-- CARA - Control y Administración de Recursos Artísticos
-- Instituto Universitario Patagónico de las Artes (IUPA)
-- PostgreSQL 15 Initial Schema

-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$ BEGIN
    CREATE TYPE asset_status AS ENUM ('Available', 'InUse', 'Maintenance', 'Decommissioned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE loan_status AS ENUM ('Pending', 'Active', 'Overdue', 'Returned', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Staff', 'Teacher', 'Student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('Confirmed', 'Cancelled', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'LoanApproved', 'LoanRejected', 'LoanDueReminder',
        'LoanOverdue', 'SanctionIssued', 'ReservationConfirmed',
        'IncidentReported'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "Assets" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "Category" VARCHAR(100) NOT NULL,
    "Status" asset_status NOT NULL DEFAULT 'Available',
    "Department" VARCHAR(100) NOT NULL,
    "Location" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(500),
    "MaxLoanDays" INTEGER NOT NULL DEFAULT 7,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "InstitutionalEmail" VARCHAR(200) NOT NULL,
    "Role" user_role NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "Loans" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "AssetId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "StartDate" TIMESTAMPTZ NOT NULL,
    "DueDate" TIMESTAMPTZ NOT NULL,
    "Status" loan_status NOT NULL DEFAULT 'Pending',
    "RejectionReason" VARCHAR(500),
    "RequestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ApprovedAt" TIMESTAMPTZ,
    "ReturnedAt" TIMESTAMPTZ,
    "ApprovedBy" UUID,
    CONSTRAINT fk_loans_asset FOREIGN KEY ("AssetId") REFERENCES "Assets"("Id") ON DELETE RESTRICT,
    CONSTRAINT fk_loans_user FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT,
    CONSTRAINT ck_loan_dates CHECK ("StartDate" < "DueDate")
);

CREATE TABLE IF NOT EXISTS "Reservations" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "AssetId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "StartDate" TIMESTAMPTZ NOT NULL,
    "EndDate" TIMESTAMPTZ NOT NULL,
    "Space" VARCHAR(200) NOT NULL,
    "Status" reservation_status NOT NULL DEFAULT 'Confirmed',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ,
    CONSTRAINT fk_reservations_asset FOREIGN KEY ("AssetId") REFERENCES "Assets"("Id") ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_user FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT,
    CONSTRAINT ck_reservation_dates CHECK ("StartDate" < "EndDate")
);

CREATE TABLE IF NOT EXISTS "Incidents" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "LoanId" UUID NOT NULL,
    "Description" VARCHAR(1000) NOT NULL,
    "PhotoUrl" VARCHAR(500),
    "ReportedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ReportedBy" UUID NOT NULL,
    "IsResolved" BOOLEAN NOT NULL DEFAULT FALSE,
    "ResolvedAt" TIMESTAMPTZ,
    CONSTRAINT fk_incidents_loan FOREIGN KEY ("LoanId") REFERENCES "Loans"("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Sanctions" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID NOT NULL,
    "Reason" VARCHAR(500) NOT NULL,
    "IssuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ResolvedAt" TIMESTAMPTZ,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_sanctions_user FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID NOT NULL,
    "Type" notification_type NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Message" VARCHAR(1000) NOT NULL,
    "ReferenceId" VARCHAR(50),
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "ReadAt" TIMESTAMPTZ,
    "SentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notifications_user FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuditLogs" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EntityName" VARCHAR(100) NOT NULL,
    "EntityId" VARCHAR(50) NOT NULL,
    "Action" VARCHAR(50) NOT NULL,
    "PerformedBy" VARCHAR(200) NOT NULL,
    "PreviousValues" JSONB,
    "NewValues" JSONB,
    "Timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Assets_Code" ON "Assets"("Code") WHERE "IsDeleted" = false;
CREATE INDEX IF NOT EXISTS "IX_Assets_Category" ON "Assets"("Category");
CREATE INDEX IF NOT EXISTS "IX_Assets_Status" ON "Assets"("Status");
CREATE INDEX IF NOT EXISTS "IX_Assets_Department" ON "Assets"("Department");

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("InstitutionalEmail");
CREATE INDEX IF NOT EXISTS "IX_Users_Role" ON "Users"("Role");

CREATE INDEX IF NOT EXISTS "IX_Loans_Status" ON "Loans"("Status");
CREATE INDEX IF NOT EXISTS "IX_Loans_UserId" ON "Loans"("UserId");
CREATE INDEX IF NOT EXISTS "IX_Loans_AssetId" ON "Loans"("AssetId");
CREATE INDEX IF NOT EXISTS "IX_Loans_DueDate" ON "Loans"("DueDate") WHERE "Status" IN ('Active', 'Overdue');

CREATE INDEX IF NOT EXISTS "IX_Reservations_Status" ON "Reservations"("Status");
CREATE INDEX IF NOT EXISTS "IX_Reservations_Asset_Dates" ON "Reservations"("AssetId", "StartDate", "EndDate");

CREATE INDEX IF NOT EXISTS "IX_Sanctions_IsActive" ON "Sanctions"("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Sanctions_UserId" ON "Sanctions"("UserId");

CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId" ON "Notifications"("UserId");
CREATE INDEX IF NOT EXISTS "IX_Notifications_IsRead" ON "Notifications"("IsRead") WHERE "IsRead" = false;

CREATE INDEX IF NOT EXISTS "IX_AuditLogs_EntityName" ON "AuditLogs"("EntityName");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_EntityId" ON "AuditLogs"("EntityId");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Timestamp" ON "AuditLogs"("Timestamp" DESC);

-- ============================================================
-- SEED DATA (optional dev seed)
-- ============================================================

-- Admin user (password: Admin123! — must be hashed in production)
INSERT INTO "Users" ("Id", "FirstName", "LastName", "InstitutionalEmail", "Role", "PasswordHash")
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Admin',
    'CARA',
    'admin@iupa.edu.ar',
    'Admin',
    '$2a$11$EXAMPLEHASH_DO_NOT_USE_IN_PRODUCTION'
) ON CONFLICT ("InstitutionalEmail") DO NOTHING;
