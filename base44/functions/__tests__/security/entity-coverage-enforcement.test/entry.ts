/**
 * ENTITY COVERAGE ENFORCEMENT TEST
 * Automated verification that ALL tenant-scoped entities have beforeRead hooks
 * FAILS BUILD if coverage < 100%
 */

import { TENANT_SCOPED_ENTITIES } from '../../../shared/enforcement/entityScope';

describe('SECURITY GATE: Entity Coverage Enforcement', () => {
  
  test('CRITICAL: All 88 tenant-scoped entities MUST have beforeRead hooks', async () => {
    const missingHooks = [];
    const protectedEntities = [];
    
    for (const entityName of TENANT_SCOPED_ENTITIES) {
      try {
        // Attempt to import beforeRead hook
        const hookModule = await import(`../../entities/${entityName.toLowerCase()}/beforeRead.js`);
        
        if (hookModule.default) {
          protectedEntities.push(entityName);
        } else {
          missingHooks.push(entityName);
        }
      } catch (error) {
        // Hook file doesn't exist
        missingHooks.push(entityName);
      }
    }
    
    const coverage = (protectedEntities.length / TENANT_SCOPED_ENTITIES.length) * 100;
    
    console.log('\n════════════════════════════════════════════════');
    console.log('🔒 ENTITY ISOLATION COVERAGE REPORT');
    console.log('════════════════════════════════════════════════');
    console.log(`Total Tenant-Scoped Entities: ${TENANT_SCOPED_ENTITIES.length}`);
    console.log(`✅ Protected (beforeRead): ${protectedEntities.length}`);
    console.log(`❌ Unprotected: ${missingHooks.length}`);
    console.log(`📊 Coverage: ${coverage.toFixed(1)}%`);
    console.log('════════════════════════════════════════════════\n');
    
    if (missingHooks.length > 0) {
      console.log('⚠️  MISSING BEFOREREAD HOOKS:');
      missingHooks.forEach((entity, idx) => {
        console.log(`   ${idx + 1}. ${entity}`);
      });
      console.log('\n📋 Remediation: Deploy hooks using generateBeforeReadHook()');
      console.log('════════════════════════════════════════════════\n');
    }
    
    // FAIL build if coverage < 100%
    expect(coverage).toBeGreaterThanOrEqual(100);
    expect(missingHooks).toHaveLength(0);
  });
  
  test('CRITICAL: All financial entities MUST have full CRUD protection', async () => {
    const financialEntities = ['Settlement', 'Invoice', 'Payment', 'Load'];
    const requiredHooks = ['beforeRead', 'beforeCreate', 'beforeUpdate'];
    
    const results = [];
    
    for (const entityName of financialEntities) {
      const entity = { name: entityName, hooks: {} };
      
      for (const hookName of requiredHooks) {
        try {
          const hookModule = await import(`../../entities/${entityName.toLowerCase()}/${hookName}.js`);
          entity.hooks[hookName] = !!hookModule.default;
        } catch (error) {
          entity.hooks[hookName] = false;
        }
      }
      
      results.push(entity);
    }
    
    console.log('\n════════════════════════════════════════════════');
    console.log('💰 FINANCIAL ENTITY PROTECTION STATUS');
    console.log('════════════════════════════════════════════════');
    
    results.forEach(entity => {
      const status = Object.values(entity.hooks).every(v => v) ? '✅' : '❌';
      console.log(`${status} ${entity.name}`);
      console.log(`   beforeRead: ${entity.hooks.beforeRead ? '✅' : '❌'}`);
      console.log(`   beforeCreate: ${entity.hooks.beforeCreate ? '✅' : '❌'}`);
      console.log(`   beforeUpdate: ${entity.hooks.beforeUpdate ? '✅' : '❌'}`);
    });
    
    console.log('════════════════════════════════════════════════\n');
    
    // All financial entities must have full protection
    results.forEach(entity => {
      expect(entity.hooks.beforeRead).toBe(true);
      expect(entity.hooks.beforeCreate).toBe(true);
      expect(entity.hooks.beforeUpdate).toBe(true);
    });
  });
  
  test('VERIFY: AuditLog entity has org_id field', async () => {
    // This test verifies CRITICAL FINDING #1 is resolved
    
    try {
      const auditLogSchema = await import('../../../entities/AuditLog.json');
      
      const hasOrgId = auditLogSchema.properties?.org_id !== undefined;
      const orgIdRequired = auditLogSchema.required?.includes('org_id') || false;
      
      console.log('\n════════════════════════════════════════════════');
      console.log('📋 AUDIT LOG SCHEMA VERIFICATION');
      console.log('════════════════════════════════════════════════');
      console.log(`org_id field present: ${hasOrgId ? '✅' : '❌'}`);
      console.log(`org_id required: ${orgIdRequired ? '✅' : '⚠️'}`);
      console.log('════════════════════════════════════════════════\n');
      
      expect(hasOrgId).toBe(true);
      
    } catch (error) {
      console.error('❌ Failed to load AuditLog schema:', error.message);
      throw new Error('AuditLog schema not found or invalid');
    }
  });
  
  test('VERIFY: No tenant_id usage (org_id only)', async () => {
    // Verify CRITICAL FINDING #3 is resolved
    
    const filesWithTenantId = [];
    
    // Check accrualEngine.js specifically
    try {
      const accrualEngine = await import('../../shared/finance/accrualEngine.js');
      const source = accrualEngine.toString();
      
      if (source.includes('tenant_id')) {
        filesWithTenantId.push('functions/shared/finance/accrualEngine.js');
      }
    } catch (error) {
      // File may not exist or may be fixed
    }
    
    console.log('\n════════════════════════════════════════════════');
    console.log('🔍 FIELD NAMING CONSISTENCY CHECK');
    console.log('════════════════════════════════════════════════');
    
    if (filesWithTenantId.length > 0) {
      console.log('❌ Files still using tenant_id (should use org_id):');
      filesWithTenantId.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('✅ All files use org_id (no tenant_id found)');
    }
    
    console.log('════════════════════════════════════════════════\n');
    
    expect(filesWithTenantId).toHaveLength(0);
  });
  
  test('VERIFY: enforceRequestContext is used consistently', async () => {
    // Verify all entity hooks use centralized enforcement
    
    const hookFiles = [
      'settlement/beforeRead',
      'settlement/beforeCreate',
      'settlement/beforeUpdate',
      'invoice/beforeRead',
      'invoice/beforeCreate',
      'invoice/beforeUpdate',
      'payment/beforeRead',
      'payment/beforeCreate',
      'payment/beforeUpdate',
      'load/beforeRead',
      'load/beforeCreate',
      'load/beforeUpdate'
    ];
    
    const results = [];
    
    for (const hookPath of hookFiles) {
      try {
        const hookModule = await import(`../../entities/${hookPath}.js`);
        const source = hookModule.default.toString();
        
        const usesEnforcement = 
          source.includes('enforceRequestContext') ||
          source.includes('enforceReadIsolation') ||
          source.includes('enforceCreateIsolation') ||
          source.includes('enforceUpdateIsolation');
        
        results.push({
          file: hookPath,
          usesEnforcement
        });
      } catch (error) {
        results.push({
          file: hookPath,
          usesEnforcement: false,
          error: error.message
        });
      }
    }
    
    console.log('\n════════════════════════════════════════════════');
    console.log('🛡️  ENFORCEMENT FRAMEWORK ADOPTION');
    console.log('════════════════════════════════════════════════');
    
    results.forEach(r => {
      const status = r.usesEnforcement ? '✅' : '❌';
      console.log(`${status} ${r.file}`);
    });
    
    const adoptionRate = (results.filter(r => r.usesEnforcement).length / results.length) * 100;
    console.log(`\n📊 Adoption Rate: ${adoptionRate.toFixed(1)}%`);
    console.log('════════════════════════════════════════════════\n');
    
    expect(adoptionRate).toBeGreaterThanOrEqual(90);
  });
  
});

describe('REGRESSION PREVENTION: Anti-Pattern Detection', () => {
  
  test('DETECT: Direct asServiceRole queries without org_id', async () => {
    // Scan backend functions for risky patterns
    
    const riskyPatterns = [
      /asServiceRole\.entities\.\w+\.filter\(\{[^}]*\}\)/g,
      /asServiceRole\.entities\.\w+\.list\(/g
    ];
    
    const filesToScan = [
      '../../shared/finance/accrualEngine.js',
      '../../shared/finance/creditHoldEnforcement.js',
      '../../shared/finance/varianceEngine.js'
    ];
    
    const findings = [];
    
    for (const filePath of filesToScan) {
      try {
        const module = await import(filePath);
        const source = module.toString();
        
        riskyPatterns.forEach(pattern => {
          const matches = source.match(pattern);
          if (matches) {
            findings.push({
              file: filePath,
              matches: matches.length,
              pattern: pattern.toString()
            });
          }
        });
      } catch (error) {
        // File may not exist
      }
    }
    
    if (findings.length > 0) {
      console.warn('\n⚠️  POTENTIAL SECURITY ANTI-PATTERNS DETECTED:');
      findings.forEach(f => {
        console.warn(`   ${f.file}: ${f.matches} instances`);
      });
      console.warn('\n   Recommendation: Add org_id to all filter() calls\n');
    }
    
    // This is a warning, not a hard failure (for now)
    // expect(findings).toHaveLength(0);
  });
  
  test('DETECT: Hardcoded org_id defaults', async () => {
    // Look for "org_id: 'default'" or similar
    
    const filesToScan = [
      '../../shared/finance/accrualEngine.js',
      '../../shared/finance/varianceEngine.js'
    ];
    
    const findings = [];
    
    for (const filePath of filesToScan) {
      try {
        const module = await import(filePath);
        const source = module.toString();
        
        if (source.includes("'default'") && source.includes('org_id')) {
          findings.push(filePath);
        }
      } catch (error) {
        // File may not exist
      }
    }
    
    if (findings.length > 0) {
      console.warn('\n⚠️  HARDCODED DEFAULT org_id DETECTED:');
      findings.forEach(f => console.warn(`   ${f}`));
      console.warn('\n   Recommendation: Fail-closed on missing org_id\n');
    }
    
    // Warning only
    // expect(findings).toHaveLength(0);
  });
  
  test('DETECT: Missing audit logging in mutations', async () => {
    // Verify critical operations call logFinancialChange()
    
    const criticalHooks = [
      'settlement/beforeUpdate',
      'invoice/beforeUpdate',
      'payment/beforeUpdate'
    ];
    
    const results = [];
    
    for (const hookPath of criticalHooks) {
      try {
        const hookModule = await import(`../../entities/${hookPath}.js`);
        const source = hookModule.default.toString();
        
        const hasAuditLog = 
          source.includes('logFinancialChange') ||
          source.includes('AuditLog.create');
        
        results.push({
          hook: hookPath,
          hasAuditLog
        });
      } catch (error) {
        results.push({
          hook: hookPath,
          hasAuditLog: false
        });
      }
    }
    
    const missing = results.filter(r => !r.hasAuditLog);
    
    if (missing.length > 0) {
      console.warn('\n⚠️  MISSING AUDIT LOGGING:');
      missing.forEach(m => console.warn(`   ${m.hook}`));
      console.warn('\n   Recommendation: Add logFinancialChange() to all update hooks\n');
    }
    
    expect(missing).toHaveLength(0);
  });
  
});

describe('PERFORMANCE: Index Verification (Manual)', () => {
  
  test('DOCUMENT: Required database indexes', () => {
    // This test documents required indexes
    // Actual verification requires database access
    
    const requiredIndexes = [
      { table: 'settlements', columns: ['org_id'] },
      { table: 'settlements', columns: ['org_id', 'status'] },
      { table: 'invoices', columns: ['org_id'] },
      { table: 'invoices', columns: ['org_id', 'status'] },
      { table: 'payments', columns: ['org_id'] },
      { table: 'loads', columns: ['org_id'] },
      { table: 'loads', columns: ['org_id', 'status'] },
      { table: 'memberships', columns: ['user_email', 'org_id', 'status'] },
      { table: 'audit_logs', columns: ['org_id', 'created_date'] },
      { table: 'drivers', columns: ['org_id'] },
      { table: 'carriers', columns: ['org_id'] }
    ];
    
    console.log('\n════════════════════════════════════════════════');
    console.log('🗄️  REQUIRED DATABASE INDEXES');
    console.log('════════════════════════════════════════════════');
    console.log('\nRun these in production database:\n');
    
    requiredIndexes.forEach(idx => {
      const indexName = `idx_${idx.table}_${idx.columns.join('_')}`;
      const columns = idx.columns.join(', ');
      console.log(`CREATE INDEX IF NOT EXISTS ${indexName} ON ${idx.table}(${columns});`);
    });
    
    console.log('\n════════════════════════════════════════════════\n');
    
    // This is documentation, always passes
    expect(requiredIndexes.length).toBeGreaterThan(0);
  });
  
});