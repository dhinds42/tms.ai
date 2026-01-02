import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Play, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MigrationDashboard() {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [seedStatus, setSeedStatus] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list('-created_date', 100),
    initialData: []
  });

  const { data: memberships } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => base44.entities.Membership.list('-created_date', 100),
    initialData: []
  });

  const runSeed = async () => {
    setRunning(true);
    try {
      const result = await base44.functions.seedRbacDefaults();
      setSeedStatus(result);
    } catch (error) {
      setSeedStatus({ ok: false, error: error.message });
    }
    setRunning(false);
  };

  const runMigration = async () => {
    if (!confirm('Run multi-tenant migration? This will create a default organization and memberships for existing users.')) {
      return;
    }
    
    setRunning(true);
    try {
      const result = await base44.functions.migrateToMultiTenant();
      setMigrationStatus(result);
    } catch (error) {
      setMigrationStatus({ ok: false, error: error.message });
    }
    setRunning(false);
  };

  const isBrokerAdmin = user?.role === 'admin';

  if (!isBrokerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">Only administrators can access migration tools.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            RBAC Migration Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Initialize multi-tenant RBAC system
          </p>
        </div>

        {/* Warning */}
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Important:</strong> Run these migrations in order. Step 1 must complete before Step 2.
          </AlertDescription>
        </Alert>

        {/* Current State */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Current System State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-600">Organizations</p>
                <p className="text-2xl font-bold text-indigo-600">{organizations.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-600">Memberships</p>
                <p className="text-2xl font-bold text-blue-600">{memberships.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-600">System Status</p>
                <Badge className={organizations.length > 0 ? 'bg-emerald-600' : 'bg-amber-600'}>
                  {organizations.length > 0 ? 'Initialized' : 'Needs Migration'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Seed RBAC */}
        <Card className="border-2 border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  Seed Default Roles & Permissions
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Creates system roles, permissions, and redaction policies</p>
              </div>
              <Button 
                onClick={runSeed} 
                disabled={running}
                className="bg-indigo-600"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Run Seed</>
                )}
              </Button>
            </div>
          </CardHeader>
          {seedStatus && (
            <CardContent className="pt-4">
              <div className={`p-4 rounded-lg ${seedStatus.ok ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {seedStatus.ok ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${seedStatus.ok ? 'text-emerald-900' : 'text-red-900'}`}>
                      {seedStatus.ok ? 'Seed Complete' : 'Seed Failed'}
                    </p>
                    {seedStatus.results && (
                      <div className="text-sm mt-2 space-y-1">
                        <p>✓ Permissions created: {seedStatus.results.permissions_created}</p>
                        <p>✓ Roles created: {seedStatus.results.roles_created}</p>
                        <p>✓ Policies created: {seedStatus.results.policies_created}</p>
                        <p>✓ Role-Permission mappings: {seedStatus.results.role_permissions_created}</p>
                      </div>
                    )}
                    {seedStatus.error && (
                      <p className="text-sm text-red-800 mt-2">{seedStatus.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Migrate to Multi-Tenant */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  Migrate Existing Data
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Creates default organization and backfills org_id</p>
              </div>
              <Button 
                onClick={runMigration} 
                disabled={running || !seedStatus?.ok}
                className="bg-purple-600"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Run Migration</>
                )}
              </Button>
            </div>
          </CardHeader>
          {migrationStatus && (
            <CardContent className="pt-4">
              <div className={`p-4 rounded-lg ${migrationStatus.ok ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {migrationStatus.ok ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${migrationStatus.ok ? 'text-emerald-900' : 'text-red-900'}`}>
                      {migrationStatus.ok ? 'Migration Complete' : 'Migration Failed'}
                    </p>
                    {migrationStatus.results && (
                      <div className="text-sm mt-2 space-y-1">
                        <p>✓ Default org created: {migrationStatus.results.default_org_created ? 'Yes' : 'Already exists'}</p>
                        <p>✓ Records backfilled: {migrationStatus.results.org_id_backfilled}</p>
                        {migrationStatus.results.errors?.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-100 rounded text-amber-900">
                            <p className="font-semibold">Warnings:</p>
                            {migrationStatus.results.errors.map((err, idx) => (
                              <p key={idx} className="text-xs">{err}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {migrationStatus.error && (
                      <p className="text-sm text-red-800 mt-2">{migrationStatus.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Next Steps */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-3">After Migration:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. ✅ Go to <strong>Organization Admin</strong> to create additional orgs</li>
              <li>2. ✅ Go to <strong>Member Management</strong> to invite users and assign roles</li>
              <li>3. ✅ Test tenant isolation by logging in as different org users</li>
              <li>4. ✅ Review <strong>User Roles</strong> to customize permissions</li>
              <li>5. ⚠️ Gradually extend remaining entity hooks with org_id filtering</li>
            </ol>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}