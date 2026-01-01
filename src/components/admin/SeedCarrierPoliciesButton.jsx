import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

export default function SeedCarrierPoliciesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await base44.functions.seedCarrierDriverPolicies();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Seed Default Carrier Policies
        </CardTitle>
        <p className="text-sm text-slate-600">
          Initialize default CarrierDriverPolicy records for asset, brokerage, and owner-operator carrier types.
          Safe to run multiple times (idempotent).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Admin Only</p>
              <p>This operation creates default policies for carrier types: <strong>asset</strong>, <strong>brokerage</strong>, <strong>oo_heavy</strong>.</p>
              <p className="mt-2">Existing policies will not be overwritten. Only missing records are inserted.</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Seeding Policies...
            </>
          ) : (
            <>
              <Database className="w-5 h-5 mr-2" />
              Run Seed Operation
            </>
          )}
        </Button>

        {result && (
          <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {result.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Seed Completed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Seed Failed</span>
                  </>
                )}
              </div>

              {result.success && result.summary && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600">Inserted</p>
                      <p className="text-2xl font-bold text-green-600">{result.summary.inserted_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Skipped (Already Exist)</p>
                      <p className="text-2xl font-bold text-slate-600">{result.summary.skipped_count}</p>
                    </div>
                  </div>

                  {result.summary.inserted_keys.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-2">Inserted Policies:</p>
                      <div className="space-y-1">
                        {result.summary.inserted_keys.map((key, idx) => (
                          <Badge key={idx} className="bg-green-600 text-white mr-2 mb-1">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.summary.skipped_keys.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Skipped (Already Exist):</p>
                      <div className="space-y-1">
                        {result.summary.skipped_keys.slice(0, 5).map((key, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-1">
                            {key}
                          </Badge>
                        ))}
                        {result.summary.skipped_keys.length > 5 && (
                          <Badge variant="outline">+ {result.summary.skipped_keys.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {result.summary.errors && result.summary.errors.length > 0 && (
                    <div className="bg-red-100 border border-red-300 rounded p-3">
                      <p className="text-sm font-semibold text-red-900 mb-2">Errors:</p>
                      {result.summary.errors.map((err, idx) => (
                        <p key={idx} className="text-xs text-red-800">
                          {err.carrier_type}:{err.feature_key} - {err.error}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    Completed at: {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              )}

              {result.error && (
                <p className="text-sm text-red-800">{result.error}</p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}