-- ============================================================================
-- DATABASE VERIFICATION SCRIPT - MULTI-TENANT ISOLATION
-- Run in STAGING/PRODUCTION database to verify tenant isolation at DB level
-- ============================================================================

-- STEP 1: Verify org_id Column Presence
-- ============================================================================

SELECT 
    '1. ORG_ID COLUMN VERIFICATION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- List all tables and check for org_id column
SELECT 
    t.table_name,
    CASE 
        WHEN c.column_name IS NOT NULL THEN '✅ Has org_id'
        ELSE '❌ MISSING org_id'
    END as org_id_status,
    CASE 
        WHEN c.is_nullable = 'NO' THEN '✅ NOT NULL'
        WHEN c.is_nullable = 'YES' THEN '⚠️  NULLABLE'
        ELSE 'N/A'
    END as nullable_status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND c.column_name = 'org_id'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN (
        'organization', 'membership', 'role', 'permission', 
        'role_permission', 'user_role', 'location', 'commodity',
        'hts_code', 'doe_fuel_price'
    )
ORDER BY 
    CASE WHEN c.column_name IS NULL THEN 0 ELSE 1 END,
    t.table_name;

-- STEP 2: Count NULL org_id Records
-- ============================================================================

SELECT 
    '2. NULL ORG_ID VERIFICATION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Dynamic query to count NULLs across all tenant-scoped tables
DO $$
DECLARE
    table_record RECORD;
    null_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'org_id' 
            AND table_schema = 'public'
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE org_id IS NULL', table_record.table_name)
        INTO null_count;
        
        IF null_count > 0 THEN
            RAISE NOTICE '❌ %: % NULL org_id records', table_record.table_name, null_count;
        ELSE
            RAISE NOTICE '✅ %: 0 NULL org_id records', table_record.table_name;
        END IF;
    END LOOP;
END $$;

-- STEP 3: Entity Distribution per Organization
-- ============================================================================

SELECT 
    '3. ENTITY DISTRIBUTION PER ORG' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Loads per org
SELECT 
    'Loads' as entity,
    org_id,
    COUNT(*) as record_count
FROM loads
GROUP BY org_id
ORDER BY record_count DESC;

-- Settlements per org
SELECT 
    'Settlements' as entity,
    org_id,
    COUNT(*) as record_count
FROM settlements
GROUP BY org_id
ORDER BY record_count DESC;

-- Invoices per org
SELECT 
    'Invoices' as entity,
    org_id,
    COUNT(*) as record_count
FROM invoices
GROUP BY org_id
ORDER BY record_count DESC;

-- STEP 4: Orphaned Records (Parent-Child org_id Mismatch)
-- ============================================================================

SELECT 
    '4. ORPHANED RECORD DETECTION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Invoice org_id must match Load org_id
SELECT 
    'Invoice-Load Mismatch' as issue,
    i.id as invoice_id,
    i.org_id as invoice_org,
    l.org_id as load_org
FROM invoices i
JOIN loads l ON i.load_id = l.id
WHERE i.org_id != l.org_id
LIMIT 100;

-- Settlement org_id must match Load org_id
SELECT 
    'Settlement-Load Mismatch' as issue,
    s.id as settlement_id,
    s.org_id as settlement_org,
    l.org_id as load_org
FROM settlements s
JOIN loads l ON s.load_id = l.id
WHERE s.org_id != l.org_id
LIMIT 100;

-- Payment org_id must match Settlement org_id
SELECT 
    'Payment-Settlement Mismatch' as issue,
    p.id as payment_id,
    p.org_id as payment_org,
    s.org_id as settlement_org
FROM payments p
JOIN settlements s ON p.settlement_id = s.id
WHERE p.org_id != s.org_id
LIMIT 100;

-- STEP 5: Index Verification
-- ============================================================================

SELECT 
    '5. INDEX VERIFICATION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- List all indexes on org_id
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexdef LIKE '%org_id%'
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Missing indexes on critical tables
SELECT 
    t.table_name,
    CASE 
        WHEN i.indexname IS NOT NULL THEN '✅ Indexed'
        ELSE '❌ MISSING INDEX'
    END as index_status
FROM information_schema.tables t
LEFT JOIN pg_indexes i 
    ON t.table_name = i.tablename 
    AND i.indexdef LIKE '%org_id%'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
        'loads', 'settlements', 'invoices', 'payments',
        'drivers', 'carriers', 'quotes', 'audit_logs'
    )
ORDER BY index_status, table_name;

-- STEP 6: FK Constraint Verification
-- ============================================================================

SELECT 
    '6. FOREIGN KEY CONSTRAINTS' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- List all FK constraints
SELECT
    tc.table_name as table_name,
    kcu.column_name as column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- STEP 7: AuditLog Verification (CRITICAL FINDING #1)
-- ============================================================================

SELECT 
    '7. AUDIT LOG VERIFICATION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Check if AuditLog has org_id column
SELECT 
    CASE 
        WHEN column_name = 'org_id' THEN '✅ AuditLog has org_id'
        ELSE '❌ AuditLog MISSING org_id (CRITICAL)'
    END as audit_log_status
FROM information_schema.columns
WHERE table_name = 'audit_logs'
    AND column_name = 'org_id'
UNION ALL
SELECT '❌ AuditLog table not found' as audit_log_status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'audit_logs'
);

-- Count audit logs per org (if org_id exists)
SELECT 
    org_id,
    COUNT(*) as audit_count,
    MIN(created_date) as first_audit,
    MAX(created_date) as last_audit
FROM audit_logs
GROUP BY org_id
ORDER BY audit_count DESC;

-- STEP 8: Cross-Tenant Query Simulation (Should Return Empty)
-- ============================================================================

SELECT 
    '8. CROSS-TENANT ACCESS TEST' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Test query: Try to get settlements from org-B while filtered for org-A
-- This should return 0 rows if isolation is working
WITH test_org AS (
    SELECT org_id FROM organizations LIMIT 1
)
SELECT 
    'Cross-Tenant Test' as test_name,
    COUNT(*) as leaked_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Isolation working'
        ELSE '❌ ISOLATION BREACH'
    END as test_result
FROM settlements s
WHERE s.org_id != (SELECT org_id FROM test_org)
    AND s.org_id IN (
        -- Simulate a malicious query trying to access other orgs
        SELECT org_id FROM organizations WHERE org_id != (SELECT org_id FROM test_org) LIMIT 1
    );

-- STEP 9: Membership Integrity Check
-- ============================================================================

SELECT 
    '9. MEMBERSHIP INTEGRITY' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Users with no active membership
SELECT 
    'Users Without Membership' as issue,
    COUNT(*) as count
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.user_id = u.id
        AND m.status = 'active'
);

-- Memberships referencing non-existent orgs
SELECT 
    'Orphaned Memberships' as issue,
    COUNT(*) as count
FROM memberships m
WHERE NOT EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = m.org_id
);

-- Multiple active memberships per user (allowed, but document)
SELECT 
    user_id,
    COUNT(*) as active_membership_count
FROM memberships
WHERE status = 'active'
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY active_membership_count DESC
LIMIT 10;

-- STEP 10: Performance Analysis
-- ============================================================================

SELECT 
    '10. PERFORMANCE ANALYSIS' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Explain plan for typical query
EXPLAIN ANALYZE
SELECT * FROM loads
WHERE org_id = 'org-123'
    AND status = 'in_transit'
LIMIT 100;

-- Should use index scan, not sequential scan
-- Expected: "Index Scan using idx_loads_org_status"

-- STEP 11: Data Retention Verification
-- ============================================================================

SELECT 
    '11. DATA RETENTION VERIFICATION' as test_section,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Check for records older than 7 years (default retention)
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as old_records,
    MIN(created_date) as oldest_record
FROM audit_logs
WHERE created_date < NOW() - INTERVAL '7 years'
GROUP BY 1;

-- Other tables with retention policies
SELECT 
    'documents' as table_name,
    COUNT(*) as old_records,
    MIN(created_date) as oldest_record
FROM documents
WHERE created_date < NOW() - INTERVAL '7 years'
GROUP BY 1;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

SELECT 
    '═══════════════════════════════════════' as section,
    'SECURITY VERIFICATION SUMMARY' as title,
    '═══════════════════════════════════════' as section2;

-- Generate summary counts
SELECT 
    'Tables with org_id' as metric,
    COUNT(*) as value
FROM information_schema.columns
WHERE column_name = 'org_id'
    AND table_schema = 'public';

SELECT 
    'Indexed org_id columns' as metric,
    COUNT(DISTINCT tablename) as value
FROM pg_indexes
WHERE indexdef LIKE '%org_id%'
    AND schemaname = 'public';

SELECT 
    'Total organizations' as metric,
    COUNT(*) as value
FROM organizations;

SELECT 
    'Active memberships' as metric,
    COUNT(*) as value
FROM memberships
WHERE status = 'active';

SELECT 
    'Audit log entries' as metric,
    COUNT(*) as value
FROM audit_logs;

-- ============================================================================
-- REMEDIATION QUERIES (Run if issues found)
-- ============================================================================

-- REMEDIATION 1: Add missing org_id columns
-- Uncomment and run for each table missing org_id
/*
ALTER TABLE table_name ADD COLUMN org_id VARCHAR(255);
UPDATE table_name SET org_id = 'default-org-id' WHERE org_id IS NULL;
ALTER TABLE table_name ALTER COLUMN org_id SET NOT NULL;
CREATE INDEX idx_table_name_org_id ON table_name(org_id);
*/

-- REMEDIATION 2: Fix NULL org_id records
-- Update records with missing org_id (use actual default org)
/*
UPDATE settlements SET org_id = (SELECT id FROM organizations LIMIT 1)
WHERE org_id IS NULL;
*/

-- REMEDIATION 3: Add missing indexes
-- Run for each critical table without org_id index
/*
CREATE INDEX idx_loads_org_id ON loads(org_id);
CREATE INDEX idx_loads_org_status ON loads(org_id, status);
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_settlements_org_id ON settlements(org_id);
CREATE INDEX idx_payments_org_id ON payments(org_id);
CREATE INDEX idx_memberships_user_org_status ON memberships(user_email, org_id, status);
*/

-- REMEDIATION 4: Add org_id to AuditLog (CRITICAL)
/*
ALTER TABLE audit_logs ADD COLUMN org_id VARCHAR(255);
-- Backfill from related entities or user memberships
UPDATE audit_logs al
SET org_id = (
    SELECT m.org_id 
    FROM memberships m 
    WHERE m.user_email = al.actor_email 
        AND m.status = 'active' 
    LIMIT 1
)
WHERE org_id IS NULL;
CREATE INDEX idx_audit_logs_org_created ON audit_logs(org_id, created_date);
*/

-- ============================================================================
-- END OF VERIFICATION SCRIPT
-- ============================================================================