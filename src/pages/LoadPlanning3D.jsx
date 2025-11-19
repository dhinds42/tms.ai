import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Cube, Package, TrendingUp, Zap } from "lucide-react";

export default function LoadPlanning3D() {
  const [items, setItems] = useState([
    { name: 'Pallet 1', length: 48, width: 40, height: 48, weight: 2000 },
    { name: 'Pallet 2', length: 48, width: 40, height: 36, weight: 1500 },
  ]);

  const trailerSpecs = { length: 53, width: 102, height: 110, maxWeight: 45000 };
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const weightUtilization = ((totalWeight / trailerSpecs.maxWeight) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Cube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            3D Load Planning & Optimization
          </h1>
          <p className="text-slate-600 mt-2">Visual cube/weight optimization for trailers</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Items</p>
                  <p className="text-3xl font-bold text-purple-600">{items.length}</p>
                </div>
                <Package className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Weight</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalWeight} lbs</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Weight Util</p>
                  <p className="text-3xl font-bold text-emerald-600">{weightUtilization}%</p>
                </div>
                <Zap className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Cube Util</p>
                  <p className="text-3xl font-bold text-blue-600">67%</p>
                </div>
                <Cube className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Trailer Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Length:</span>
                  <span className="font-semibold">{trailerSpecs.length} ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Width:</span>
                  <span className="font-semibold">{trailerSpecs.width} in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Height:</span>
                  <span className="font-semibold">{trailerSpecs.height} in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Max Weight:</span>
                  <span className="font-semibold">{trailerSpecs.maxWeight} lbs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Load Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900">{item.name}</p>
                    <p className="text-xs text-purple-700">
                      {item.length}x{item.width}x{item.height}" • {item.weight} lbs
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Cube className="w-24 h-24 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">3D Visualization</h3>
            <p className="text-slate-600 mb-4">Interactive 3D load visualization will render here</p>
            <Button className="bg-purple-600">Optimize Layout</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}