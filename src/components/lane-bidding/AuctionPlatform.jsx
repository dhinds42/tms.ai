import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock, TrendingDown, DollarSign } from "lucide-react";

export default function AuctionPlatform() {
  const [bidAmount, setBidAmount] = useState('');

  const activeLanes = [
    { id: 1, origin: 'Chicago, IL', destination: 'Dallas, TX', currentBid: 1850, minBid: 1800, bidsCount: 5, timeLeft: '2h 15m' },
    { id: 2, origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', currentBid: 950, minBid: 900, bidsCount: 3, timeLeft: '45m' },
    { id: 3, origin: 'Atlanta, GA', destination: 'Miami, FL', currentBid: 1200, minBid: 1150, bidsCount: 7, timeLeft: '1h 30m' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-amber-600" />
          Live Lane Auctions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {activeLanes.map(lane => (
          <div key={lane.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-slate-900">{lane.origin} → {lane.destination}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-600">{lane.bidsCount} bids</Badge>
                  <div className="flex items-center gap-1 text-xs text-amber-700">
                    <Clock className="w-3 h-3" />
                    {lane.timeLeft} left
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600">Current Bid</p>
                <p className="text-2xl font-bold text-emerald-600">${lane.currentBid}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Min: $${lane.minBid}`}
                className="flex-1"
              />
              <Button className="bg-amber-600">
                <Gavel className="w-4 h-4 mr-2" />
                Place Bid
              </Button>
            </div>
          </div>
        ))}

        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">Cost Savings</h4>
          </div>
          <p className="text-3xl font-bold text-emerald-600">$4,250</p>
          <p className="text-xs text-emerald-700">Saved through auctions this month</p>
        </div>

      </CardContent>
    </Card>
  );
}