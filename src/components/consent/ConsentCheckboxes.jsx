import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, Shield } from "lucide-react";
import { CONSENT_PURPOSES, CONSENT_TEXTS, DRIVER_MANDATORY_CONSENTS } from "./ConsentManager";

export default function ConsentCheckboxes({
  entityType = 'driver',
  entityId,
  purposes = ['location_tracking', 'analytics', 'marketing'],
  mandatoryPurposes = DRIVER_MANDATORY_CONSENTS,
  initialConsents = {},
  onChange,
  showDescriptions = true,
  jurisdiction = 'usa'
}) {
  const [consents, setConsents] = useState(initialConsents);
  const [expandedPurpose, setExpandedPurpose] = useState(null);

  useEffect(() => {
    setConsents(initialConsents);
  }, [initialConsents]);

  const handleConsentChange = (purpose, checked) => {
    const newConsents = { ...consents, [purpose]: checked };
    setConsents(newConsents);
    onChange?.(newConsents);
  };

  const allMandatoryGranted = mandatoryPurposes
    .filter(p => purposes.includes(p))
    .every(p => consents[p] === true);

  const filteredPurposes = purposes.filter(p => 
    CONSENT_PURPOSES[p]?.jurisdiction?.includes(jurisdiction)
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          Privacy & Consent
        </CardTitle>
        <p className="text-sm text-slate-500">
          Please review and provide your consent for the following data processing purposes.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allMandatoryGranted && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Required consents</p>
              <p className="text-xs text-amber-700">
                You must accept all mandatory consents to complete activation.
              </p>
            </div>
          </div>
        )}

        {filteredPurposes.map((purposeId) => {
          const purpose = CONSENT_PURPOSES[purposeId];
          const isMandatory = mandatoryPurposes.includes(purposeId);
          const isChecked = consents[purposeId] === true;
          const isExpanded = expandedPurpose === purposeId;

          return (
            <div
              key={purposeId}
              className={`p-4 rounded-lg border transition-all ${
                isChecked
                  ? 'bg-emerald-50 border-emerald-200'
                  : isMandatory
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={purposeId}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleConsentChange(purposeId, checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={purposeId}
                      className="font-medium text-slate-900 cursor-pointer"
                    >
                      {purpose?.label || purposeId}
                    </label>
                    {isMandatory && (
                      <Badge className="bg-red-600 text-xs">Required</Badge>
                    )}
                    {isChecked && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  
                  {showDescriptions && (
                    <p className="text-sm text-slate-600 mt-1">
                      {purpose?.description}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedPurpose(isExpanded ? null : purposeId)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    {isExpanded ? 'Hide full consent text' : 'View full consent text'}
                  </button>

                  {isExpanded && CONSENT_TEXTS[purposeId] && (
                    <div className="mt-3 p-3 bg-white rounded border border-slate-200 text-xs text-slate-700">
                      {CONSENT_TEXTS[purposeId]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium">
                {Object.values(consents).filter(Boolean).length}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredPurposes.length}</span>
              {' '}consents granted
            </div>
            {allMandatoryGranted ? (
              <Badge className="bg-emerald-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready to proceed
              </Badge>
            ) : (
              <Badge className="bg-amber-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Mandatory consents required
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { CONSENT_PURPOSES, DRIVER_MANDATORY_CONSENTS };