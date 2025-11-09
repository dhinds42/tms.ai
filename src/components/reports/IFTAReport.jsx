import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Fuel, AlertTriangle } from "lucide-react";

export default function IFTAReport({ loads, drivers, ownerOperators, isLoading }) {
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Filter loads by quarter
  const getQuarterDates = (q, y) => {
    const quarters = {
      Q1: { start: new Date(y, 0, 1), end: new Date(y, 2, 31) },
      Q2: { start: new Date(y, 3, 1), end: new Date(y, 5, 30) },
      Q3: { start: new Date(y, 6, 1), end: new Date(y, 8, 30) },
      Q4: { start: new Date(y, 9, 1), end: new Date(y, 11, 31) }
    };
    return quarters[q];
  };

  const { start, end } = getQuarterDates(quarter, parseInt(year));
  const quarterLoads = loads.filter(load => {
    const date = new Date(load.actual_delivery || load.delivery_date || load.created_date);
    return date >= start && date <= end && load.status === 'delivered';
  });

  // Calculate IFTA data by state
  const iftaData = {};
  quarterLoads.forEach(load => {
    // Estimate miles per state (simplified - in production would use actual routing data)
    const states = [load.pickup_location?.state, load.dropoff_location?.state].filter(s => s);
    const milesPerState = (load.distance_miles || 0) / states.length;

    states.forEach(state => {
      if (!iftaData[state]) {
        iftaData[state] = {
          state,
          miles: 0,
          gallons: 0,
          taxRate: 0.35, // Average state diesel tax rate
          taxOwed: 0
        };
      }
      
      iftaData[state].miles += milesPerState;
      const gallons = milesPerState / 6.5; // Avg 6.5 MPG
      iftaData[state].gallons += gallons;
      iftaData[state].taxOwed += gallons * iftaData[state].taxRate;
    });
  });

  const iftaList = Object.values(iftaData).sort((a, b) => b.miles - a.miles);
  const totalMiles = iftaList.reduce((sum, s) => sum + s.miles, 0);
  const totalGallons = iftaList.reduce((sum, s) => sum + s.gallons, 0);
  const totalTax = iftaList.reduce((sum, s) => sum + s.taxOwed, 0);

  // Export
  const handleExport = () => {
    const headers = ['State', 'Miles', 'Gallons', 'Tax Rate', 'Tax Owed'];
    const rows = iftaList.map(s => [
      s.state,
      s.miles.toFixed(2),
      s.gallons.toFixed(2),
      s.taxRate.toFixed(4),
      s.taxOwed.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `TOTALS,${totalMiles.toFixed(2)},${totalGallons.toFixed(2)},,${totalTax.toFixed(2)}`
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ifta-report-${quarter}-${year}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Warning Banner */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">IFTA Reporting Notice</h3>
              <p className="text-sm text-amber-800">
                This IFTA report is generated based on load data and estimated mileage per state. 
                For accurate IFTA filing, please verify actual mileage using GPS/ELD data and 
                consult with your tax advisor. State tax rates are approximate averages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            IFTA Reporting Period
            <Badge className="ml-auto bg-amber-600">Carrier Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Quarter</Label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full bg-emerald-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export IFTA Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Miles</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalMiles.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Gallons</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{totalGallons.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg MPG</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {totalGallons > 0 ? (totalMiles / totalGallons).toFixed(1) : '0.0'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Tax Owed</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${totalTax.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* State Breakdown Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>IFTA by State - {quarter} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">State</th>
                  <th className="text-right p-3 font-semibold">Miles</th>
                  <th className="text-right p-3 font-semibold">Gallons</th>
                  <th className="text-right p-3 font-semibold">MPG</th>
                  <th className="text-right p-3 font-semibold">Tax Rate</th>
                  <th className="text-right p-3 font-semibold">Tax Owed</th>
                </tr>
              </thead>
              <tbody>
                {iftaList.map((state, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-bold">{state.state}</td>
                    <td className="p-3 text-right">{state.miles.toLocaleString()}</td>
                    <td className="p-3 text-right">{state.gallons.toFixed(2)}</td>
                    <td className="p-3 text-right">{(state.miles / state.gallons).toFixed(1)}</td>
                    <td className="p-3 text-right">${state.taxRate.toFixed(4)}</td>
                    <td className="p-3 text-right font-bold text-red-600">${state.taxOwed.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td className="p-3 font-bold">TOTAL</td>
                  <td className="p-3 text-right font-bold">{totalMiles.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold">{totalGallons.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold">
                    {totalGallons > 0 ? (totalMiles / totalGallons).toFixed(1) : '0.0'}
                  </td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right font-bold text-red-600 text-lg">${totalTax.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Helpful Info */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle>IFTA Filing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p><strong>Filing Deadlines:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Q1 (Jan-Mar): Due April 30</li>
            <li>Q2 (Apr-Jun): Due July 31</li>
            <li>Q3 (Jul-Sep): Due October 31</li>
            <li>Q4 (Oct-Dec): Due January 31</li>
          </ul>
          <p className="mt-4"><strong>Required Documentation:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Distance records (by jurisdiction)</li>
            <li>Fuel purchase receipts</li>
            <li>Vehicle registrations</li>
            <li>ELD/GPS mileage reports</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}