import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Package } from "lucide-react";

export default function DeliveryScheduler() {
  const [deliveries] = useState([
    { id: 1, customer: 'John Smith', address: '123 Main St, Dallas, TX', window: '9:00 AM - 12:00 PM', status: 'scheduled' },
    { id: 2, customer: 'Jane Doe', address: '456 Oak Ave, Dallas, TX', window: '12:00 PM - 3:00 PM', status: 'in_transit' },
    { id: 3, customer: 'Bob Johnson', address: '789 Pine Rd, Dallas, TX', window: '3:00 PM - 6:00 PM', status: 'scheduled' }
  ]);

  const getStatusColor = (status) => {
    return status === 'scheduled' ? 'bg-blue-600' : 
           status === 'in_transit' ? 'bg-amber-600' : 
           'bg-emerald-600';
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          Final Mile Delivery Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-900">{delivery.customer}</span>
              </div>
              <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
            </div>
            <div className="text-sm text-amber-800 space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{delivery.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Window: {delivery.window}</span>
              </div>
            </div>
          </div>
        ))}

        <Button className="w-full bg-amber-600">
          <Calendar className="w-4 h-4 mr-2" />
          Optimize Route
        </Button>

      </CardContent>
    </Card>
  );
}