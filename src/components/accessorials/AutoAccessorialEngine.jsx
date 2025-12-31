import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, MapPin } from "lucide-react";

export default function AutoAccessorialEngine({ load, onApply }) {
  const detectAccessorials = () => {
    const charges = [];
    
    // Detention detection
    if (load.actual_pickup_datetime && load.planned_pickup_datetime) {
      const pickupDelay = (new Date(load.actual_pickup_datetime) - new Date(load.planned_pickup_datetime)) / 60000;
      if (pickupDelay > 120) { // 2 hours free time
        const detentionHours = Math.ceil((pickupDelay - 120) / 60);
        charges.push({
          type: 'detention',
          amount: detentionHours * 5000, // $50/hr in cents
          description: `${detentionHours}h detention at pickup`,
          auto_detected: true
        });
      }
    }
    
    // Layover detection
    const tripDays = load.distance_miles_planned ? Math.ceil(load.distance_miles_planned / 500) : 0;
    if (tripDays > 2) {
      charges.push({
        type: 'layover',
        amount: (tripDays - 2) * 10000, // $100/day
        description: `${tripDays - 2} day layover`,
        auto_detected: true
      });
    }
    
    // TONU detection
    if (load.tonu) {
      charges.push({
        type: 'tonu',
        amount: load.tonu_charges || 25000,
        description: 'Truck ordered not used',
        auto_detected: true
      });
    }
    
    return charges;
  };
  
  const suggestedCharges = detectAccessorials();
  
  if (suggestedCharges.length === 0) return null;
  
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-600" />
          Auto-Detected Charges
          <Badge className="ml-auto bg-purple-600 text-xs">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestedCharges.map((charge, idx) => (
          <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold capitalize">{charge.type}</p>
              <p className="text-xs text-slate-600">{charge.description}</p>
            </div>
            <p className="text-lg font-bold text-purple-600">${(charge.amount / 100).toFixed(2)}</p>
          </div>
        ))}
        
        <Button 
          onClick={() => onApply(suggestedCharges)} 
          size="sm" 
          className="w-full bg-purple-600"
        >
          Apply All Charges (${(suggestedCharges.reduce((s, c) => s + c.amount, 0) / 100).toFixed(2)})
        </Button>
      </CardContent>
    </Card>
  );
}