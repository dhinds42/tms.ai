import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, TrendingUp, Info } from "lucide-react";

export default function ClassEstimator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    weight: ''
  });
  const [estimatedClass, setEstimatedClass] = useState(null);

  const freightClasses = [
    { class: 50, density: '50+', description: 'Very dense items (bricks, cement)' },
    { class: 55, density: '35-50', description: 'Dense items (hardwood flooring)' },
    { class: 60, density: '30-35', description: 'Dense goods (car parts, machinery)' },
    { class: 65, density: '22.5-30', description: 'Moderate density (bottled beverages)' },
    { class: 70, density: '15-22.5', description: 'Medium density (auto parts, food)' },
    { class: 77.5, density: '13.5-15', description: 'Light-medium (tires, bathroom fixtures)' },
    { class: 85, density: '12-13.5', description: 'Light items (crated machinery)' },
    { class: 92.5, density: '10.5-12', description: 'Low density (computers, monitors)' },
    { class: 100, density: '9-10.5', description: 'Very light (boat covers, car covers)' },
    { class: 110, density: '8-9', description: 'Bulky light (cabinets, framed artwork)' },
    { class: 125, density: '7-8', description: 'Low density (small household appliances)' },
    { class: 150, density: '6-7', description: 'Very low density (auto sheet metal)' },
    { class: 175, density: '5-6', description: 'Light, bulky (clothing, stuffed toys)' },
    { class: 200, density: '4-5', description: 'Very bulky (auto parts, aircraft parts)' },
    { class: 250, density: '3-4', description: 'Extremely bulky (bamboo furniture)' },
    { class: 300, density: '2-3', description: 'Ultra low density (ping pong balls)' },
    { class: 400, density: '1-2', description: 'Lowest density (deer antlers)' },
    { class: 500, density: '<1', description: 'Exceptionally low (bags of gold dust)' }
  ];

  const calculateClass = () => {
    const l = parseFloat(dimensions.length);
    const w = parseFloat(dimensions.width);
    const h = parseFloat(dimensions.height);
    const weight = parseFloat(dimensions.weight);

    if (!l || !w || !h || !weight) {
      alert('Please enter all dimensions and weight');
      return;
    }

    // Calculate cubic feet
    const cubicFeet = (l * w * h) / 1728; // 1728 cubic inches = 1 cubic foot

    // Calculate PCF (Pounds per Cubic Foot)
    const pcf = weight / cubicFeet;

    // Determine freight class based on density
    let estimatedClassValue = 500;
    if (pcf >= 50) estimatedClassValue = 50;
    else if (pcf >= 35) estimatedClassValue = 55;
    else if (pcf >= 30) estimatedClassValue = 60;
    else if (pcf >= 22.5) estimatedClassValue = 65;
    else if (pcf >= 15) estimatedClassValue = 70;
    else if (pcf >= 13.5) estimatedClassValue = 77.5;
    else if (pcf >= 12) estimatedClassValue = 85;
    else if (pcf >= 10.5) estimatedClassValue = 92.5;
    else if (pcf >= 9) estimatedClassValue = 100;
    else if (pcf >= 8) estimatedClassValue = 110;
    else if (pcf >= 7) estimatedClassValue = 125;
    else if (pcf >= 6) estimatedClassValue = 150;
    else if (pcf >= 5) estimatedClassValue = 175;
    else if (pcf >= 4) estimatedClassValue = 200;
    else if (pcf >= 3) estimatedClassValue = 250;
    else if (pcf >= 2) estimatedClassValue = 300;
    else if (pcf >= 1) estimatedClassValue = 400;

    setEstimatedClass({
      class: estimatedClassValue,
      pcf: pcf.toFixed(2),
      cubicFeet: cubicFeet.toFixed(2),
      description: freightClasses.find(c => c.class === estimatedClassValue)?.description
    });
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          LTL Class Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-semibold mb-1">How Freight Class is Determined:</p>
              <p className="text-xs text-blue-700">
                Freight class is based on density (weight per cubic foot). Lower density = higher class = higher rate.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Length (inches)</label>
            <Input
              type="number"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              placeholder="48"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Width (inches)</label>
            <Input
              type="number"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              placeholder="40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Height (inches)</label>
            <Input
              type="number"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
              placeholder="48"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Weight (lbs)</label>
            <Input
              type="number"
              value={dimensions.weight}
              onChange={(e) => setDimensions({...dimensions, weight: e.target.value})}
              placeholder="500"
            />
          </div>
        </div>

        <Button onClick={calculateClass} className="w-full bg-blue-600 text-white">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Freight Class
        </Button>

        {estimatedClass && (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Estimated Freight Class</h3>
              <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                Class {estimatedClass.class}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-600">Density (PCF)</p>
                <p className="text-2xl font-bold text-slate-900">{estimatedClass.pcf}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Cubic Feet</p>
                <p className="text-2xl font-bold text-slate-900">{estimatedClass.cubicFeet}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              <strong>Description:</strong> {estimatedClass.description}
            </p>
            <div className="mt-4 p-3 bg-white rounded border border-emerald-200">
              <p className="text-xs text-slate-600">
                ⚠️ This is an estimate based on density. Actual class may vary based on commodity type, 
                stowability, handling, and liability. Confirm with NMFC classification or carrier.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 mb-3">Freight Class Reference Table</h4>
          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-semibold">Class</th>
                  <th className="text-left p-2 font-semibold">Density (PCF)</th>
                  <th className="text-left p-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {freightClasses.map(fc => (
                  <tr key={fc.class} className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-blue-600">{fc.class}</td>
                    <td className="p-2">{fc.density}</td>
                    <td className="p-2 text-xs">{fc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}