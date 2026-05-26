/**
 * Server-Side Load List Handler
 * Enforces RBAC, scoping, and data redaction
 */

import { base44 } from '@base44/sdk';
import { authorize, scopeQuery, redactResponse } from '../middleware/authorize.js';

export default async function listLoads(request, context) {
  try {
    const user = context.user;
    const operatingMode = request.headers['x-operating-mode'] || 'broker';
    const query = request.query || {};
    
    // 1. Authorize - check user can read loads
    const canReadAll = await authorize(user, 'load.read.all', { operatingMode }).catch(() => false);
    
    if (!canReadAll) {
      // Try assigned loads permission
      await authorize(user, 'load.read.assigned', { operatingMode });
    }
    
    // 2. Scope query to user's accessible records
    const scopedQuery = scopeQuery('Load', query, user, operatingMode);
    
    // 3. Fetch loads
    const loads = await base44.asServiceRole.entities.Load.filter(
      scopedQuery,
      request.query.sort || '-created_date',
      request.query.limit || 100
    );
    
    // 4. Redact sensitive fields based on role
    const redactedLoads = redactResponse('Load', loads, user, operatingMode);
    
    return {
      statusCode: 200,
      body: {
        success: true,
        data: redactedLoads,
        count: redactedLoads.length
      }
    };
    
  } catch (error) {
    if (error.statusCode) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.error,
          message: error.message
        }
      };
    }
    
    console.error('Load list error:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal Server Error'
      }
    };
  }
}