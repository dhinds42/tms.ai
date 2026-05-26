/**
 * Server-Side Carrier Creation Handler
 * FMCSA verification, duplicate prevention, validation
 */

import { base44 } from '@base44/sdk';
import { validateCreate, checkDuplicates } from '../middleware/validateEntity.js';
import { authorize } from '../middleware/authorize.js';
import { logAudit } from '../audit/auditLogger.js';

export default async function createCarrier(request, context) {
  try {
    const user = context.user;
    const data = request.body;
    const operatingMode = request.headers['x-operating-mode'] || 'broker';
    
    // 1. Authorize
    await authorize(user, 'carrier.create', { operatingMode });
    
    // 2. Validate
    await validateCreate('Carrier', data, user, operatingMode);
    
    // 3. Check duplicate MC number
    await checkDuplicates('Carrier', data, base44.asServiceRole);
    
    // 4. Optional: FMCSA verification (if API key configured)
    // const fmcsaValid = await verifyFMCSA(data.mc_number);
    // if (!fmcsaValid) throw { statusCode: 400, error: 'FMCSA verification failed' };
    
    // 5. Create carrier
    const carrier = await base44.asServiceRole.entities.Carrier.create({
      ...data,
      onboarded_by: user.email,
      onboarded_at: new Date().toISOString()
    });
    
    // 6. Audit log
    await logAudit(base44.asServiceRole, {
      entityType: 'Carrier',
      entityId: carrier.id,
      action: 'CREATE',
      userId: user.id,
      userEmail: user.email,
      userRole: operatingMode,
      changes: data,
      afterSnapshot: carrier
    });
    
    return {
      statusCode: 201,
      body: {
        success: true,
        data: carrier
      }
    };
    
  } catch (error) {
    if (error.statusCode) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.error,
          errors: error.errors
        }
      };
    }
    
    console.error('Carrier creation error:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal Server Error'
      }
    };
  }
}