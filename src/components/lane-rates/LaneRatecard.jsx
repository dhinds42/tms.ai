import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Fuel, MapPin, Calendar, TrendingUp } from "lucide-react";

export default function LaneRatecard({ lanes, rates }) {
  // Group rates by lane
  const ratesByLane = {};
  rates.forEach(rate => {
    if (!ratesByLane[rate.lane_id]) {
      ratesByLane[rate.lane_id] = [];
    }
    ratesByLane[rate.lane_id].push(rate);
  });

  const calculateFSCPreview = (rate) => {
    if (!rate.fsc_enabled || rate.fsc_handling !== 'SEPARATE') return null;
    
    const linehaul = rate.customer_rate * 100; // Convert to cents
    
    if (rate.fsc_method === 'FLAT_PER_MILE') {
      const fscAmount = (rate.lane_miles * rate.fsc_cpm_cents) / 100;
      return {
        method: 'Per Mile',
        amount: fscAmount,
        detail: `${rate.fsc_cpm_cents}¢/mi × ${rate.lane_miles} mi`
      };
    } else if (rate.fsc_method === 'PERCENT_OF_LINEHAUL') {
      const fscAmount = (linehaul * rate.fsc_percent_bps) / 10000 / 100;
      return {
        method: 'Percent',
        amount: fscAmount,
        detail: `${(rate.fsc_percent_bps / 100).toFixed(2)}% of $${rate.customer_rate.toFixed(2)}`
      };
    } else if (rate.fsc_method === 'TABLE_LOOKUP') {
      return {
        method: 'Table',
        amount: 0,
        detail: 'Variable (see table)'
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            Lane Rate Card
          </CardTitle>
          <p className="text-sm text-slate-600">Customer pricing by lane with FSC details</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {lanes.filter(l => l.is_active && ratesByLane[l.id]?.length > 0).map(lane => {
              const laneRates = ratesByLane[lane.id] || [];
              
              return (
                <Card key={lane.id} className="border-2">
                  <CardHeader className="bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-slate-600" />
                          <h3 className="font-bold text-slate-900">
                            {lane.origin_city}, {lane.origin_state} → {lane.dest_city}, {lane.dest_state}
                          </h3>
                        </div>
                        <div className="flex gap-2 text-xs text-slate-600">
                          <Badge variant="outline">{lane.transport_mode}</Badge>
                          {lane.equipment_type && <Badge variant="outline">{lane.equipment_type}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Active Rates</p>
                        <p className="text-xl font-bold text-indigo-600">{laneRates.length}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Miles</TableHead>
                          <TableHead>Base Rate</TableHead>
                          <TableHead>FSC</TableHead>
                          <TableHead>Est. Total</TableHead>
                          <TableHead>Effective</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laneRates.filter(r => r.is_active).map(rate => {
                          const fscPreview = calculateFSCPreview(rate);
                          const estimatedTotal = rate.customer_rate + (fscPreview?.amount || 0);
                          
                          return (
                            <TableRow key={rate.id}>
                              <TableCell>
                                <Badge className={
                                  rate.status === 'active' ? 'bg-green-500' :
                                  rate.status === 'pending' ? 'bg-amber-500' :
                                  'bg-slate-500'
                                }>
                                  {rate.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{rate.lane_miles} mi</TableCell>
                              <TableCell className="font-semibold">
                                ${rate.customer_rate.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {rate.fsc_enabled ? (
                                  <div>
                                    {rate.fsc_handling === 'INCLUDED' ? (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        Included
                                      </Badge>
                                    ) : fscPreview ? (
                                      <div>
                                        <p className="font-semibold text-green-600">
                                          ${fscPreview.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">{fscPreview.detail}</p>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">No FSC</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-indigo-600">
                                  ${estimatedTotal.toFixed(2)}
                                </div>
                                {fscPreview && fscPreview.method !== 'Table' && (
                                  <p className="text-xs text-slate-500">
                                    ${rate.customer_rate.toFixed(2)} + ${fscPreview.amount.toFixed(2)}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600">
                                {rate.effective_date ? new Date(rate.effective_date).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}

            {lanes.filter(l => l.is_active && ratesByLane[l.id]?.length > 0).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No lanes with configured rates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}