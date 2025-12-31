import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, TrendingUp } from "lucide-react";

export default function AdvancedPricingRules() {
  const [rules, setRules] = useState([
    { id: 1, name: 'Weekend Premium', condition: 'pickup_day in [sat,sun]', markup_percent: 15, active: true },
    { id: 2, name: 'Short Notice', condition: 'booking_hours < 24', markup_percent: 20, active: true },
    { id: 3, name: 'Team Service', condition: 'service_type = team', markup_percent: 35, active: true }
  ]);
  
  const [showCreate, setShowCreate] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pricing Rules
          </CardTitle>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="p-3 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{rule.name}</p>
              <p className="text-xs text-slate-600">{rule.condition}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500">+{rule.markup_percent}%</Badge>
              <Badge variant={rule.active ? 'default' : 'outline'}>
                {rule.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
        
        {showCreate && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
            <div>
              <Label>Rule Name</Label>
              <Input placeholder="Holiday Premium" />
            </div>
            <div>
              <Label>Markup %</Label>
              <Input type="number" placeholder="25" />
            </div>
            <div className="flex gap-2">
              <Button size="sm">Save Rule</Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}