import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

export default function AuctionPlatform() {
  const [bidAmount, setBidAmount] = useState('');

  const mockAuctions = [
    { lane: 'Chicago, IL → Dallas, TX', currentBid: 2450, bids: 7, timeLeft: '2h 15m' },
    { lane: 'Los Angeles, CA → Phoenix, AZ', currentBid: 1850, bids: 12, timeLeft: '4h 30m' },
    { lane: 'Atlanta, GA → Miami, FL', currentBid: 1920, bids: 5, timeLeft: '1h 45m' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          Lane Bidding & Auction Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">🎯 Live Auctions</h4>
          <p className="text-sm text-slate-600">
            Compete for freight lanes in real-time reverse auctions
          </p>
        </div>

        <div className="space-y-3">
          {mockAuctions.map((auction, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{auction.lane}</p>
                  <p className="text-xs text-slate-600">Current bid: ${auction.currentBid}</p>
                </div>
                <Badge className="bg-amber-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {auction.timeLeft}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="Your bid"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1"
                />
                <Button className="bg-amber-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Bid
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">{auction.bids} bids received</p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}