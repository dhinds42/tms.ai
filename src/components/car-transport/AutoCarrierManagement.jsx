import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus } from "lucide-react";

export default function AutoCarrierManagement() {
  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  const autoCarriers = carriers.filter(c => c.equipment_types?.includes('auto_hauler'));

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Auto Hauler Carriers</CardTitle>
          <Button className="bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Auto Carrier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {autoCarriers.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No auto carriers configured</p>
            <p className="text-sm text-slate-500 mt-2">Add carriers with "auto_hauler" equipment type</p>
          </div>
        ) : (
          <div className="space-y-3">
            {autoCarriers.map(carrier => (
              <div key={carrier.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-bold text-orange-900">{carrier.company_name}</p>
                  <p className="text-sm text-orange-700">MC: {carrier.mc_number}</p>
                </div>
                <Badge className="bg-orange-600">Auto Hauler</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}