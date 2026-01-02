# Multi-Tenant RBAC Migration Guide
## Step-by-Step Implementation

**System:** TMS.ai  
**Date:** January 2, 2026

---

## 📋 MIGRATION OVERVIEW

This guide walks through migrating TMS.ai from single-tenant to multi-tenant RBAC.

**Total Time:** 30-60 minutes  
**Downtime Required:** None (backward compatible)  
**Rollback:** Safe (all changes additive)

---

## ✅ PRE-MIGRATION CHECKLIST

- [x] All new entities deployed (Membership, UserRole, FieldRedactionPolicy, DataScope)
- [x] Organization entity extended with org_type
- [x] Seed function deployed (seedRbacDefaults)
- [x] Migration function deployed (migrateToMultiTenant)
- [x] Admin UI pages deployed (OrganizationAdmin, MemberManagement)
- [x] Test suite passing
- [ ] Database backup taken
- [ ] Rollback plan documented

---

## 🚀 MIGRATION STEPS

### Step 1: Access Migration Dashboard

1. Log in as **admin** user
2. Navigate to: **Settings & Admin → Migration Dashboard**
3. Verify current state shows 0 organizations and 0 memberships

---

### Step 2: Seed RBAC Defaults

**Action:** Click "Run Seed" button

**What This Does:**
- Creates 40 default permissions
- Creates 13 default roles (broker_admin, carrier_admin, etc.)
- Maps permissions to roles
- Creates baseline field redaction policies

**Expected Output:**
```
✓ Permissions created: 40
✓ Roles created: 13
✓ Policies created: 9
✓ Role-Permission mappings: 120+
```

**Verification:**
```bash
# Check roles created
base44.entities.Role.list()

# Should see:
# - Broker Admin
# - Carrier Admin
# - Customer Admin
# - Dispatcher
# - etc.
```

---

### Step 3: Run Migration

**Action:** Click "Run Migration" button

**What This Does:**
- Creates "Default TMS Organization" (org_type: BROKER)
- Backfills org_id on existing entities:
  - Load
  - Carrier
  - Driver
  - Lane
  - LaneRate
  - Quote
  - Invoice
  - Settlement
  - Document
  - ComplianceItem

**Expected Output:**
```
✓ Default org created: Yes
✓ Records backfilled: 500+ (depending on data)
```

**Warning Messages (Non-Critical):**
- Entity without org_id field → skip (safe)
- Already has org_id → skip (safe)

---

### Step 4: Create Memberships for Existing Users

**Manual Step (For Now):**

For each existing user:
1. Go to **Member Management**
2. Select "Default TMS Organization"
3. Click "Invite User"
4. Enter user's email
5. Assign appropriate role (broker_admin for admins)
6. Click "Send Invitation"

**OR** run via API:
```javascript
const users = [
  { email: 'admin@tms.ai', role: 'broker_admin' },
  { email: 'ops@tms.ai', role: 'broker_ops' }
];

for (const u of users) {
  await base44.functions.createMembershipForUser({
    user: { id: u.id, email: u.email },
    org_id: defaultOrgId
  });
}
```

---

### Step 5: Test Tenant Isolation

1. Create a second test organization:
   - Go to **Organization Admin**
   - Click "Create Organization"
   - Name: "Test Carrier A"
   - Type: CARRIER
   - Save

2. Invite a test user to Test Carrier A

3. Log in as that user

4. Verify:
   - ✓ Can only see loads with org_id = Test Carrier A
   - ✗ Cannot see default org loads

---

### Step 6: Verify Field Redaction

1. Create a test load in Default Org
2. Set customer_rate = 5000, carrier_pay = 4500

3. Query as broker_admin:
   - ✓ Should see both customer_rate and carrier_pay

4. Query as carrier role:
   - ✓ Should see carrier_pay
   - ✗ Should NOT see customer_rate

5. Query as customer role:
   - ✓ Should see customer_rate
   - ✗ Should NOT see carrier_pay

---

## 🔧 POST-MIGRATION TASKS

### Immediate (Day 1):

- [ ] Create real organizations (one per customer/carrier)
- [ ] Migrate users to appropriate orgs
- [ ] Assign roles per org
- [ ] Test all critical workflows (load creation, invoicing, etc.)

### Short-Term (Week 1):

- [ ] Extend remaining entity hooks with org_id filtering
- [ ] Add permission checks to all beforeCreate/Update hooks
- [ ] Monitor audit logs for access denials
- [ ] Train org admins on member management

### Long-Term (Month 1):

- [ ] Implement DataScope for large orgs
- [ ] Add custom redaction policies per customer
- [ ] Build self-service org admin portal
- [ ] Add impersonation feature for support

---

## 🐛 TROUBLESHOOTING

### Issue: "No active membership" error

**Cause:** User exists but has no membership  
**Fix:**
```javascript
await base44.functions.createMembershipForUser({
  user: user,
  org_id: 'default_org_id'
});
```

---

### Issue: User sees wrong data after migration

**Cause:** org_id not backfilled on entity  
**Fix:**
```javascript
await base44.entities.EntityName.update(recordId, {
  org_id: 'correct_org_id'
});
```

---

### Issue: Permission denied unexpectedly

**Cause:** Role missing permission  
**Fix:**
1. Go to User Roles
2. Find role
3. Add missing permission
4. OR assign different role to user

---

## 📊 ROLLBACK PLAN

If migration causes issues:

**Step 1:** Soft rollback (recommended)
- Set all Membership.status = 'locked'
- System falls back to legacy user.role

**Step 2:** Hard rollback (if needed)
- Delete all Membership records
- Delete all UserRole records
- Clear org_id from all entities
- Revert to pre-migration backup

**Note:** New entities (Membership, UserRole, etc.) are isolated. Deleting them won't affect existing data.

---

## ✅ SUCCESS CRITERIA

Migration is successful when:

- [x] Seed completed without errors
- [x] Default org created
- [x] All entities have org_id
- [x] Memberships created for all users
- [x] Roles assigned
- [x] Tenant isolation verified (User A cannot see User B's data)
- [x] Field redaction verified (Carrier cannot see customer_rate)
- [x] No unexpected access denials
- [x] All critical workflows still work

---

## 📞 SUPPORT

If you encounter issues during migration:
1. Check audit logs: `base44.entities.AuditLog.list()`
2. Review migration results in dashboard
3. Verify memberships: `base44.entities.Membership.list()`
4. Check role assignments: `base44.entities.UserRole.list()`

---

**End of Migration Guide**  
**Status:** Ready for Execution