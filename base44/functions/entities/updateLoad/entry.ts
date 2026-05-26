/**
 * Server-Side Load Update Handler
 * Enforces validation, RBAC, audit logging, and status transitions
 */

import { base44 } from '@base44/sdk';
import { validateUpdate } from '../middleware/validateEntity.js';
import { authorize, authorizeRecordAccess, redactResponse } from '../middleware/authorize.js';
import { logAudit, getChangedFields } from '../audit/auditLogger.js';

export default async function updateLoad(request, context) {
  try {
    const user = context.user;
    const { id } = request.params;
    const data = request.body;
    const operatingMode = request.headers['x-operating-mode'] || 'broker';
    
    // 1. Fetch existing load
    const existingLoads = await base44.asServiceRole.entities.Load.filter({ id });
    if (existingLoads.length === 0) {
      return {
        statusCode: 404,
        body: {
          success: false,
          error: 'Not Found',
          message: 'Load not found'
        }
      };
    }
    
    const existingLoad = existingLoads[0];
    
    // 2. Authorize - check user can access this specific load
    await authorizeRecordAccess(user, 'Load', existingLoad, operatingMode);
    
    // 3. Authorize - check user can update loads
    await authorize(user, 'load.update.status', { operatingMode });
    
    // 4. If updating rates, check rate permission
    if (data.customer_rate || data.carrier_pay || data.margin) {
      await authorize(user, 'load.update.rates', { operatingMode });
    }
    
    // 5. Validate data
    await validateUpdate('Load', id, data, existingLoad, user, operatingMode);
    
    // 6. Update entity
    const updatedLoad = await base44.asServiceRole.entities.Load.update(id, data);
    
    // 7. Audit log with changes
    const changes = getChangedFields(existingLoad, updatedLoad);
    
    await logAudit(base44.asServiceRole, {
      entityType: 'Load',
      entityId: id,
      action: 'UPDATE',
      userId: user.id,
      userEmail: user.email,
      userRole: operatingMode,
      changes,
      beforeSnapshot: existingLoad,
      afterSnapshot: updatedLoad,
      metadata: {
        source: 'api',
        endpoint: '/entities/Load/update',
        fieldsChanged: Object.keys(changes)
      }
    });
    
    // 8. Redact response
    const redacted = redactResponse('Load', updatedLoad, user, operatingMode);
    
    return {
      statusCode: 200,
      body: {
        success: true,
        data: redacted
      }
    };
    
  } catch (error) {
    if (error.statusCode) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.error,
          message: error.message,
          errors: error.errors
        }
      };
    }
    
    console.error('Load update error:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal Server Error'
      }
    };
  }
}