import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BeakerIcon, Users, TrendingUp, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PolicyABTestFramework({ carrierId, alertId }) {
  const [testConfig, setTestConfig] = useState({
    test_name: '',
    control_pct: 50,
    duration_days: 30,
    feature_key: '',
    test_changes: {}
  });
  const queryClient = useQueryClient();

  const { data: drivers } = useQuery({
    queryKey: ['drivers', carrierId],
    queryFn: () => base44.entities.Driver.filter({ party_id: carrierId }),
    initialData: []
  });

  const { data: alert } = useQuery({
    queryKey: ['alert', alertId],
    queryFn: async () => {
      if (!alertId) return null;
      const alerts = await base44.entities.PolicyAlert.filter({ id: alertId });
      return alerts[0];
    },
    enabled: !!alertId
  });

  const createTestMutation = useMutation({
    mutationFn: async (config) => {
      // Split drivers randomly
      const eligibleDrivers = drivers.filter(d => d.status === 'active');
      const shuffled = [...eligibleDrivers].sort(() => Math.random() - 0.5);
      const splitIndex = Math.floor(shuffled.length * (config.control_pct / 100));
      
      const controlGroup = shuffled.slice(0, splitIndex);
      const testGroup = shuffled.slice(splitIndex);

      // Create A/B test record (simplified - would be separate entity in production)
      const testMetadata = {
        test_name: config.test_name,
        carrier_id: carrierId,
        feature_key: config.feature_key,
        alert_id: alertId,
        control_group: controlGroup.map(d => d.id),
        test_group: testGroup.map(d => d.id),
        test_changes: config.test_changes,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + config.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };

      // Apply test policy to test group drivers
      for (const driver of testGroup) {
        // Create driver-specific eligibility overrides
        const existing = await base44.entities.DriverFeatureEligibility.filter({
          driver_id: driver.id,
          feature_key: config.feature_key
        });

        if (existing.length > 0) {
          await base44.entities.DriverFeatureEligibility.update(existing[0].id, {
            carrier_override: true,
            override_reason: `A/B Test: ${config.test_name}`,
            override_expires_at: testMetadata.end_date,
            eligible: config.test_changes.enabled !== false
          });
        }
      }

      // Log test creation
      await base44.entities.AuditLog.create({
        entity_type: 'PolicyABTest',
        entity_id: config.test_name,
        action: 'AB_TEST_CREATED',
        actor_email: (await base44.auth.me()).email,
        actor_role: (await base44.auth.me()).role,
        metadata: testMetadata
      });

      return testMetadata;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setTestConfig({
        test_name: '',
        control_pct: 50,
        duration_days: 30,
        feature_key: '',
        test_changes: {}
      });
    }
  });

  // Pre-fill from alert if available
  React.useEffect(() => {
    if (alert?.recommended_changes) {
      setTestConfig(prev => ({
        ...prev,
        feature_key: alert.recommended_changes.feature_key || alert.feature_key,
        test_changes: alert.recommended_changes.suggested_updates,
        test_name: `${alert.alert_type}_test_${new Date().getTime()}`
      }));
    }
  }, [alert]);

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BeakerIcon className="w-5 h-5 text-purple-600" />
          A/B Test Policy Changes
        </CardTitle>
        <p className="text-sm text-slate-600">Test policy changes with a subset of drivers before full rollout</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div>
          <Label>Test Name</Label>
          <Input
            value={testConfig.test_name}
            onChange={(e) => setTestConfig({...testConfig, test_name: e.target.value})}
            placeholder="e.g., detention_threshold_increase_jan2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Control Group %</Label>
            <Input
              type="number"
              value={testConfig.control_pct}
              onChange={(e) => setTestConfig({...testConfig, control_pct: Number(e.target.value)})}
              min={20}
              max={80}
            />
            <p className="text-xs text-slate-500 mt-1">
              Control: {Math.floor(drivers.length * (testConfig.control_pct / 100))} drivers
            </p>
          </div>

          <div>
            <Label>Test Duration (days)</Label>
            <Input
              type="number"
              value={testConfig.duration_days}
              onChange={(e) => setTestConfig({...testConfig, duration_days: Number(e.target.value)})}
              min={7}
              max={90}
            />
          </div>
        </div>

        {alert && (
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-indigo-900 mb-2">Alert-Suggested Changes:</p>
              {Object.entries(alert.recommended_changes?.suggested_updates || {}).map(([key, value]) => (
                <div key={key} className="text-xs text-indigo-800">
                  • {key}: {JSON.stringify(value)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Drivers:</span>
            <span className="font-semibold">{drivers.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Control Group:</span>
            <span className="font-semibold">{Math.floor(drivers.length * (testConfig.control_pct / 100))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Test Group:</span>
            <span className="font-semibold">{Math.ceil(drivers.length * ((100 - testConfig.control_pct) / 100))}</span>
          </div>
        </div>

        <Button
          onClick={() => createTestMutation.mutate(testConfig)}
          disabled={!testConfig.test_name || !testConfig.feature_key || createTestMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {createTestMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating test...
            </>
          ) : (
            <>
              <BeakerIcon className="w-4 h-4 mr-2" />
              Start A/B Test
            </>
          )}
        </Button>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <p className="text-xs text-amber-900">
              ⚠️ Test group drivers will receive policy overrides for {testConfig.duration_days} days. 
              Monitor dispute rates, on-time %, and feature usage during test period.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}