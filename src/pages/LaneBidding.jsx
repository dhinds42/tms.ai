import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { Gavel, TrendingDown, Clock, Award } from "lucide-react";

import AuctionPlatform from "../components/lane-bidding/AuctionPlatform";

export default function LaneBidding() {
  // TODO: Replace with real bidding entity when implemented
  const [activeBids] = useState([
    { id: 1, lane: 'Chicago, IL → Dallas, TX', current_bid: 1850, bids: 5, time_left: '2h 15m', isExample: true },
    { id: 2, lane: 'Los Angeles, CA → Phoenix, AZ', current_bid: 950, bids: 8, time_left: '4h 30m', isExample: true },
    { id: 3, lane: 'Atlanta, GA → Miami, FL', current_bid: 1200, bids: 3, time_left: '1h 45m', isExample: true },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-4">
            <Gavel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
            Lane Bidding & Auction Platform
          </h1>
          <p className="text-slate-600 mt-2">Let carriers bid on your contracted lanes</p>
          <Badge className="mt-2 bg-amber-100 text-amber-800">⚠️ Demo Data - Bidding entity not yet implemented</Badge>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Auctions</p>
                  <p className="text-3xl font-bold text-amber-600">{activeBids.length}</p>
                </div>
                <Gavel className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bids</p>
                  <p className="text-3xl font-bold text-indigo-600">{activeBids.reduce((sum, b) => sum + b.bids, 0)}</p>
                </div>
                <Award className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Savings</p>
                  <p className="text-3xl font-bold text-emerald-600">12%</p>
                </div>
                <TrendingDown className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Closing Soon</p>
                  <p className="text-3xl font-bold text-red-600">2</p>
                </div>
                <Clock className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {activeBids.map(bid => (
            <Card key={bid.id} className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{bid.lane}</h3>
                    <p className="text-sm text-slate-600">{bid.bids} bids • Ends in {bid.time_left}</p>
                  </div>
                  <Badge className="bg-amber-600">LIVE</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-2">Current Winning Bid</p>
                    <p className="text-3xl font-bold text-emerald-600">${bid.current_bid}</p>
                  </div>
                  <Input placeholder="Your bid" type="number" className="w-32" />
                  <Button className="bg-amber-600">Place Bid</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auction Platform */}
        <AuctionPlatform />

      </div>
    </div>
  );
}