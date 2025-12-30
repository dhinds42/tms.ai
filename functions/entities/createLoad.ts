/**
 * Server-Side Load Creation Handler
 * Enforces validation, RBAC, and audit logging
 */

import { base44 } from '@base44/sdk';
import { validateCreate, checkDuplicates } from '../middleware/validateEntity.js';
import { authorize, redactResponse } from '../middleware/authorize.js';
import { logAudit } from '../audit/auditLogger.js';

export default async function createLoad(request, context) {
  try {
    const user = context.user;
    const data = request.body;
    const operatingMode = request.headers['x-operating-mode'] || 'broker';
    
    // 1. Authorize - check user can create loads
    await authorize(user, 'load.create', { operatingMode });
    
    // 2. Validate data
    await validateCreate('Load', data, user, operatingMode);
    
    // 3. Check for duplicates
    if (data.load_number) {
      await checkDuplicates('Load', data, base44.asServiceRole);
    }
    
    // 4. Add audit metadata
    const enrichedData = {
      ...data,
      created_by_user: user.email,
      created_by_role: user.role || operatingMode
    };
    
    // 5. Create entity
    const load = await base44.asServiceRole.entities.Load.create(enrichedData);
    
    // 6. Audit log
    await logAudit(base44.asServiceRole, {
      entityType: 'Load',
      entityId: load.id,
      action: 'CREATE',
      userId: user.id,
      userEmail: user.email,
      userRole: operatingMode,
      changes: data,
      afterSnapshot: load,
      metadata: {
        source: 'api',
        endpoint: '/entities/Load/create'
      }
    });
    
    // 7. Redact response based on role
    const redacted = redactResponse('Load', load, user, operatingMode);
    
    return {
      statusCode: 201,
      body: {
        success: true,
        data: redacted
      }
    };
    
  } catch (error) {
    // Handle validation errors
    if (error.statusCode === 400 || error.statusCode === 409) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.error,
          errors: error.errors
        }
      };
    }
    
    // Handle auth errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.error,
          message: error.message
        }
      };
    }
    
    // Unexpected errors
    console.error('Load creation error:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create load'
      }
    };
  }
}