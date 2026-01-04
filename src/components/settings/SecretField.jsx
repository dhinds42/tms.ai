import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";

export function SecretField({ label, secretName, description }) {
  const orgId = useCurrentOrgId();
  const [value, setValue] = useState("");

  // Backend must return only { configured: boolean }
  // e.g., base44.functions.getSecretStatus({ secretName })
  // omitted here for brevity.

  const save = async () => {
    if (!orgId) return;
    await base44.functions.setOrgSecret({
      secret_name: secretName,
      secret_value: value,
    });
    setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{label}</div>
          {description && <div className="text-sm text-slate-500">{description}</div>}
        </div>
        <Badge variant="secondary">configured status from backend</Badge>
      </div>

      <div className="flex gap-2">
        <Input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter new secret (stored server-side)"
        />
        <Button onClick={save} disabled={!orgId || !value}>
          Save
        </Button>
      </div>
    </div>
  );
}