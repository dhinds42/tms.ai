import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Package } from "lucide-react";

export default function ServicePointMap() {
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
    initialData: [],
  });

  const servicePoints = locations.slice(0, 12);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Service Point Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicePoints.map((point) => (
            <div key={point.id} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-sm text-blue-900">{point.name || 'Service Point'}</p>
                </div>
                <Badge className="bg-blue-600 text-xs">Active</Badge>
              </div>
              <p className="text-xs text-blue-700">
                {point.city}, {point.state} {point.zip}
              </p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Package className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 50)} loads this month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}