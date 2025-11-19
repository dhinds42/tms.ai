import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Plus } from "lucide-react";

export default function DealerManagement() {
  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: () => base44.entities.Party.list(),
    initialData: [],
  });

  const dealers = parties.filter(p => p.party_type === 'customer' && p.industry === 'automotive_dealer');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Car Dealers</CardTitle>
          <Button className="bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Dealer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dealers.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No dealers configured</p>
            <p className="text-sm text-slate-500 mt-2">Add dealers as customers with "automotive_dealer" industry type</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dealers.map(dealer => (
              <div key={dealer.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-bold text-orange-900">{dealer.company_name}</p>
                  <p className="text-sm text-orange-700">{dealer.city}, {dealer.state}</p>
                </div>
                <Badge className="bg-orange-600">Dealer</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}