/**
 * Multi-Tenant Data Isolation Hardening
 * Enforces tenant_id at ORM level with automatic filtering
 */

export class TenantIsolation {
  constructor() {
    this.currentTenantId = null;
    this.queryInterceptors = new Map();
  }

  /**
   * Set current tenant context
   */
  setTenant(tenantId) {
    this.currentTenantId = tenantId;
    console.log(`[TENANT] Set context to: ${tenantId}`);
  }

  /**
   * Get current tenant ID
   */
  getTenantId() {
    if (!this.currentTenantId) {
      throw new Error('[SECURITY] No tenant context set - potential data leak');
    }
    return this.currentTenantId;
  }

  /**
   * Inject tenant_id into query automatically
   */
  injectTenantFilter(entityName, query = {}) {
    const tenantId = this.getTenantId();
    
    // Add tenant_id to query filter
    const secureQuery = {
      ...query,
      tenant_id: tenantId
    };

    console.log(`[TENANT FILTER] ${entityName}:`, secureQuery);
    return secureQuery;
  }

  /**
   * Validate entity belongs to current tenant
   */
  validateTenantOwnership(entity, entityName) {
    const tenantId = this.getTenantId();
    
    if (entity.tenant_id && entity.tenant_id !== tenantId) {
      throw new Error(
        `[SECURITY VIOLATION] Cross-tenant access attempt: ${entityName} ` +
        `belongs to tenant ${entity.tenant_id}, current tenant is ${tenantId}`
      );
    }
    
    return true;
  }

  /**
   * Wrap entity data with tenant_id before create
   */
  wrapCreateData(data) {
    const tenantId = this.getTenantId();
    
    return {
      ...data,
      tenant_id: tenantId
    };
  }

  /**
   * Generate tenant-specific encryption key
   */
  getTenantEncryptionKey(tenantId) {
    // In production, retrieve from secure key management system
    // This is a placeholder - use AWS KMS, HashiCorp Vault, etc.
    const baseKey = process.env.MASTER_ENCRYPTION_KEY || 'demo_key';
    
    // Derive tenant-specific key (simplified)
    return `${baseKey}_tenant_${tenantId}`;
  }

  /**
   * Encrypt sensitive data with tenant-specific key
   */
  encryptData(data, tenantId) {
    const key = this.getTenantEncryptionKey(tenantId);
    
    // In production, use proper encryption (AES-256-GCM)
    // This is a placeholder
    const encrypted = Buffer.from(JSON.stringify(data)).toString('base64');
    
    return {
      encrypted_data: encrypted,
      encryption_version: '1.0',
      tenant_id: tenantId
    };
  }

  /**
   * Decrypt data with tenant-specific key
   */
  decryptData(encryptedData, tenantId) {
    const key = this.getTenantEncryptionKey(tenantId);
    
    // Verify tenant ownership
    if (encryptedData.tenant_id !== tenantId) {
      throw new Error('[SECURITY] Cannot decrypt data from different tenant');
    }
    
    // In production, use proper decryption
    const decrypted = JSON.parse(
      Buffer.from(encryptedData.encrypted_data, 'base64').toString('utf-8')
    );
    
    return decrypted;
  }

  /**
   * Test for cross-tenant data leaks
   */
  async runSecurityTests(entityName, testFn) {
    const results = {
      passed: 0,
      failed: 0,
      errors: []
    };

    // Test 1: Ensure tenant filter is applied
    try {
      this.setTenant('tenant_1');
      const query = this.injectTenantFilter(entityName, {});
      if (query.tenant_id !== 'tenant_1') {
        throw new Error('Tenant filter not applied');
      }
      results.passed++;
    } catch (error) {
      results.failed++;
      results.errors.push({ test: 'tenant_filter', error: error.message });
    }

    // Test 2: Block cross-tenant access
    try {
      this.setTenant('tenant_1');
      const foreignEntity = { tenant_id: 'tenant_2', data: 'test' };
      
      try {
        this.validateTenantOwnership(foreignEntity, entityName);
        // Should have thrown error
        results.failed++;
        results.errors.push({ 
          test: 'cross_tenant_block', 
          error: 'Failed to block cross-tenant access' 
        });
      } catch (e) {
        // Expected to throw
        results.passed++;
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ test: 'cross_tenant_block', error: error.message });
    }

    // Test 3: Ensure data creation includes tenant_id
    try {
      this.setTenant('tenant_1');
      const wrapped = this.wrapCreateData({ name: 'test' });
      if (!wrapped.tenant_id || wrapped.tenant_id !== 'tenant_1') {
        throw new Error('tenant_id not added to create data');
      }
      results.passed++;
    } catch (error) {
      results.failed++;
      results.errors.push({ test: 'create_injection', error: error.message });
    }

    console.log(`[SECURITY TEST] ${entityName}:`, results);
    return results;
  }
}

export const tenantIsolation = new TenantIsolation();
export default tenantIsolation;