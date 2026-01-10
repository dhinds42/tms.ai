import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Award, Clock, Plus } from "lucide-react";

import RFPManager from "../components/rfp/RFPManager";

export default function RFPManagement() {
  const { data: rfpEvents = [] } = useScopedEntity('RfpEvent', { limit: 100 });
  const { data: rfpBids = [] } = useScopedEntity('RfpBid', { limit: 500 });

  const activeRFPs = rfpEvents.filter(r => r.status === 'open');
  const totalBids = rfpBids.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              RFP/Bid Management
            </h1>
            <p className="text-slate-600 mt-2">Request for Proposal and competitive bidding</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create RFP
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active RFPs</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeRFPs.length}</p>
                </div>
                <FileText className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bids</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalBids}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Awarded</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {rfpEvents.filter(r => r.status === 'awarded').length}
                  </p>
                </div>
                <Award className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">2.4d</p>
                </div>
                <Clock className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Active RFP Events</CardTitle>
          </CardHeader>
          <CardContent>
            {rfpEvents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No RFP events</h3>
                <p className="text-slate-600">Create your first RFP to get competitive bids</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rfpEvents.map((rfp) => {
                  const eventBids = rfpBids.filter(b => b.rfp_event_id === rfp.id);
                  
                  return (
                    <div key={rfp.id} className="p-4 border border-slate-200 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{rfp.event_name}</h4>
                          <p className="text-sm text-slate-600">{rfp.description}</p>
                        </div>
                        <Badge className={
                          rfp.status === 'open' ? 'bg-emerald-600' :
                          rfp.status === 'awarded' ? 'bg-purple-600' :
                          'bg-slate-600'
                        }>
                          {rfp.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Bids Received</p>
                          <p className="font-bold text-slate-900">{eventBids.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Close Date</p>
                          <p className="font-bold text-slate-900">
                            {rfp.bid_deadline ? new Date(rfp.bid_deadline).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Lanes</p>
                          <p className="font-bold text-slate-900">{rfp.lane_count || 0}</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full mt-4">
                        View Bids & Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RFP Manager */}
        <RFPManager />

      </div>
    </div>
  );
}