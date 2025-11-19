import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function LoadBoardConnector() {
  const [connected] = useState({
    dat: true,
    truckstop: true,
    loadboard123: false
  });

  const [posted] = useState([
    { load: 'Load #12345', boards: ['DAT', 'Truckstop'], views: 45, bids: 3 },
    { load: 'Load #12346', boards: ['DAT'], views: 28, bids: 1 },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Load Board Connector
          </h1>
          <p className="text-slate-600 mt-2">Auto-post to DAT/Truckstop/123Loadboard from TMS</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">DAT</h3>
                {connected.dat ? (
                  <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>
                ) : (
                  <Badge className="bg-red-600"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">15 loads posted today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Truckstop.com</h3>
                {connected.truckstop ? (
                  <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>
                ) : (
                  <Badge className="bg-red-600"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">12 loads posted today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">123 Loadboard</h3>
                {connected.loadboard123 ? (
                  <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>
                ) : (
                  <Badge className="bg-red-600"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
                )}
              </div>
              <Button size="sm" className="bg-purple-600">Connect</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Posted Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posted.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-semibold text-purple-900">{item.load}</p>
                    <div className="flex gap-2 mt-1">
                      {item.boards.map(board => (
                        <Badge key={board} variant="outline">{board}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>👁️ {item.views} views</span>
                    <span>📧 {item.bids} bids</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}