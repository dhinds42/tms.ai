import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Box, 
  Package, 
  TrendingUp, 
  Zap, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Download, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Truck,
  Scale,
  Ruler,
  RotateCcw,
  Layers,
  Target,
  BarChart3,
  Settings,
  Eye,
  Move,
  Maximize2
} from "lucide-react";

export default function LoadPlanning3D() {
  const [items, setItems] = useState([
    { id: 1, name: 'Pallet A', length: 48, width: 40, height: 48, weight: 2000, stackable: true, fragile: false },
    { id: 2, name: 'Pallet B', length: 48, width: 40, height: 36, weight: 1500, stackable: true, fragile: false },
    { id: 3, name: 'Crate C', length: 36, width: 36, height: 24, weight: 800, stackable: false, fragile: true },
    { id: 4, name: 'Box D', length: 24, width: 24, height: 24, weight: 500, stackable: true, fragile: false },
  ]);

  const [trailerType, setTrailerType] = useState("53ft_dryvan");
  const [newItem, setNewItem] = useState({ name: '', length: '', width: '', height: '', weight: '' });
  const [viewMode, setViewMode] = useState("3d");

  const trailerSpecs = {
    "53ft_dryvan": { name: "53' Dry Van", length: 636, width: 102, height: 110, maxWeight: 45000 },
    "48ft_dryvan": { name: "48' Dry Van", length: 576, width: 102, height: 110, maxWeight: 44000 },
    "53ft_reefer": { name: "53' Reefer", length: 630, width: 100, height: 108, maxWeight: 43500 },
    "26ft_box": { name: "26' Box Truck", length: 312, width: 96, height: 96, maxWeight: 10000 },
  };

  const currentTrailer = trailerSpecs[trailerType];
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const weightUtilization = ((totalWeight / currentTrailer.maxWeight) * 100);
  
  // Calculate cube utilization
  const totalItemVolume = items.reduce((sum, i) => sum + (i.length * i.width * i.height), 0);
  const trailerVolume = currentTrailer.length * currentTrailer.width * currentTrailer.height;
  const cubeUtilization = ((totalItemVolume / trailerVolume) * 100);

  // Calculate linear feet
  const linearFeet = items.reduce((sum, i) => sum + (i.length / 12), 0);
  const trailerLinearFeet = currentTrailer.length / 12;
  const linearUtilization = ((linearFeet / trailerLinearFeet) * 100);

  const addItem = () => {
    if (newItem.name && newItem.length && newItem.width && newItem.height && newItem.weight) {
      setItems([...items, {
        id: Date.now(),
        name: newItem.name,
        length: Number(newItem.length),
        width: Number(newItem.width),
        height: Number(newItem.height),
        weight: Number(newItem.weight),
        stackable: true,
        fragile: false
      }]);
      setNewItem({ name: '', length: '', width: '', height: '', weight: '' });
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getUtilizationColor = (value) => {
    if (value >= 90) return 'text-red-600';
    if (value >= 75) return 'text-emerald-600';
    if (value >= 50) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getUtilizationBg = (value) => {
    if (value >= 90) return 'bg-red-100';
    if (value >= 75) return 'bg-emerald-100';
    if (value >= 50) return 'bg-blue-100';
    return 'bg-amber-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Box className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">3D Load Planning</h1>
                  <p className="text-purple-200 text-base mt-1">Visual cube & weight optimization for maximum trailer utilization</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {items.length} Items
                </Badge>
                <Badge className={`${weightUtilization > 90 ? 'bg-red-500' : 'bg-emerald-500'} text-white border-0 px-3 py-1 text-sm font-medium`}>
                  {weightUtilization.toFixed(0)}% Weight
                </Badge>
              </div>
            </div>

            {/* Trailer Selector & Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <Select value={trailerType} onValueChange={setTrailerType}>
                <SelectTrigger className="h-12 bg-white border-0 shadow-lg rounded-xl md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(trailerSpecs).map(([key, spec]) => (
                    <SelectItem key={key} value={key}>{spec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 md:ml-auto">
                <Button variant="outline" className="h-12 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button className="h-12 px-6 bg-purple-600 hover:bg-purple-700 font-semibold rounded-xl shadow-lg">
                  <Zap className="w-5 h-5 mr-2" /> Optimize Layout
                </Button>
              </div>
            </div>
          </div>

          {/* Utilization Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-xl ${getUtilizationBg(weightUtilization)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Weight</span>
              </div>
              <p className={`text-2xl font-bold ${getUtilizationColor(weightUtilization)}`}>{weightUtilization.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">{totalWeight.toLocaleString()} / {currentTrailer.maxWeight.toLocaleString()} lbs</p>
            </div>
            <div className={`p-4 rounded-xl ${getUtilizationBg(cubeUtilization)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Cube</span>
              </div>
              <p className={`text-2xl font-bold ${getUtilizationColor(cubeUtilization)}`}>{cubeUtilization.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Volume utilization</p>
            </div>
            <div className={`p-4 rounded-xl ${getUtilizationBg(linearUtilization)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Linear Feet</span>
              </div>
              <p className={`text-2xl font-bold ${getUtilizationColor(linearUtilization)}`}>{linearFeet.toFixed(1)} ft</p>
              <p className="text-xs text-slate-500">of {trailerLinearFeet.toFixed(0)} ft available</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Items</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{items.length}</p>
              <p className="text-xs text-slate-500">Loaded on trailer</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Items & 3D View */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 3D Visualization */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Move className="w-5 h-5" /> Load Visualization
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant={viewMode === '3d' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('3d')}>
                      <Box className="w-4 h-4 mr-1" /> 3D
                    </Button>
                    <Button variant={viewMode === 'top' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('top')}>
                      <Eye className="w-4 h-4 mr-1" /> Top
                    </Button>
                    <Button variant={viewMode === 'side' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('side')}>
                      <Maximize2 className="w-4 h-4 mr-1" /> Side
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-8 min-h-[300px] flex items-center justify-center relative">
                  {/* Simple 3D representation */}
                  <div className="relative">
                    {/* Trailer outline */}
                    <div className="w-80 h-32 border-2 border-dashed border-slate-400 rounded-lg bg-white/50 relative">
                      <p className="absolute -top-6 left-0 text-xs text-slate-500">{currentTrailer.name}</p>
                      
                      {/* Items visualization */}
                      <div className="absolute inset-2 flex gap-1 items-end">
                        {items.map((item, idx) => {
                          const colors = ['bg-purple-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-pink-400'];
                          const widthPercent = Math.min((item.length / currentTrailer.length) * 100, 25);
                          const heightPercent = Math.min((item.height / currentTrailer.height) * 100, 100);
                          return (
                            <div 
                              key={item.id}
                              className={`${colors[idx % colors.length]} rounded shadow-md flex items-center justify-center text-white text-xs font-bold`}
                              style={{ 
                                width: `${widthPercent}%`, 
                                height: `${heightPercent}%`,
                                minWidth: '30px'
                              }}
                              title={`${item.name}: ${item.length}x${item.width}x${item.height}"`}
                            >
                              {idx + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Dimensions */}
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>0 ft</span>
                      <span>{trailerLinearFeet.toFixed(0)} ft</span>
                    </div>
                  </div>
                  
                  {items.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Add items to visualize the load</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Item Form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Name</Label>
                    <Input 
                      placeholder="Item name" 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">L (in)</Label>
                    <Input 
                      type="number" 
                      placeholder="48"
                      value={newItem.length}
                      onChange={(e) => setNewItem({...newItem, length: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">W (in)</Label>
                    <Input 
                      type="number" 
                      placeholder="40"
                      value={newItem.width}
                      onChange={(e) => setNewItem({...newItem, width: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">H (in)</Label>
                    <Input 
                      type="number" 
                      placeholder="48"
                      value={newItem.height}
                      onChange={(e) => setNewItem({...newItem, height: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weight</Label>
                    <Input 
                      type="number" 
                      placeholder="lbs"
                      value={newItem.weight}
                      onChange={(e) => setNewItem({...newItem, weight: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="mt-3 w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Items List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Load Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                            ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'][idx % 5]
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.length}" × {item.width}" × {item.height}" • {item.weight.toLocaleString()} lbs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.fragile && <Badge variant="outline" className="text-red-600 border-red-200">Fragile</Badge>}
                          {item.stackable && <Badge variant="outline" className="text-emerald-600 border-emerald-200">Stackable</Badge>}
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* Trailer Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Trailer Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Length</span>
                  <span className="font-semibold">{(currentTrailer.length / 12).toFixed(0)} ft</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Width</span>
                  <span className="font-semibold">{currentTrailer.width} in</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Height</span>
                  <span className="font-semibold">{currentTrailer.height} in</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Max Weight</span>
                  <span className="font-semibold">{currentTrailer.maxWeight.toLocaleString()} lbs</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weightUtilization > 90 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Weight Warning</p>
                    <p className="text-xs text-red-700">Approaching max weight. Consider removing items or using a larger trailer.</p>
                  </div>
                )}
                {weightUtilization < 40 && items.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">📉 Underutilized Load</p>
                    <p className="text-xs text-blue-700">Only {weightUtilization.toFixed(0)}% weight capacity. Consider consolidating with another shipment.</p>
                  </div>
                )}
                {cubeUtilization < 50 && items.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">📦 Low Space Utilization</p>
                    <p className="text-xs text-amber-700">Only {cubeUtilization.toFixed(0)}% cube used. Consider stacking or adding more items.</p>
                  </div>
                )}
                {items.filter(i => i.fragile).length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-pink-200">
                    <p className="text-xs font-semibold text-pink-900 mb-1">🔴 Fragile Items</p>
                    <p className="text-xs text-pink-700">Load fragile items last and place on top. Use padding between items.</p>
                  </div>
                )}
                {items.length >= 3 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-900 mb-1">✓ Load Sequence</p>
                    <p className="text-xs text-emerald-700">Suggested order: {items.sort((a,b) => b.weight - a.weight).slice(0,3).map(i => i.name).join(' → ')}</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">💡 Stacking Tip</p>
                  <p className="text-xs text-purple-700">Stack lighter items on heavier ones to maximize vertical space.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">⚖️ Weight Distribution</p>
                  <p className="text-xs text-purple-700">Place heaviest items over the axles for better stability.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🔒 Secure Load</p>
                  <p className="text-xs text-purple-700">Fill gaps with dunnage to prevent shifting during transit.</p>
                </div>
              </CardContent>
            </Card>

            {/* Axle Weight Distribution */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <Scale className="w-4 h-4" /> Axle Weight Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-white/80 rounded-lg">
                  <span className="text-xs text-slate-600">Steer Axle (est.)</span>
                  <span className="text-sm font-bold text-blue-700">{Math.round(totalWeight * 0.15).toLocaleString()} lbs</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/80 rounded-lg">
                  <span className="text-xs text-slate-600">Drive Axles (est.)</span>
                  <span className="text-sm font-bold text-blue-700">{Math.round(totalWeight * 0.45).toLocaleString()} lbs</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/80 rounded-lg">
                  <span className="text-xs text-slate-600">Trailer Axles (est.)</span>
                  <span className="text-sm font-bold text-blue-700">{Math.round(totalWeight * 0.40).toLocaleString()} lbs</span>
                </div>
                <p className="text-xs text-blue-700 p-2 bg-blue-50 rounded">💡 Federal limit: 80,000 lbs gross, 34,000 lbs per axle group</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2 text-purple-600" /> Auto-Optimize
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> Export Plan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2 text-slate-600" /> Reset All
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Load heaviest items first, toward the front</p>
                <p>• Keep fragile items on top</p>
                <p>• Aim for 75-85% weight utilization</p>
                <p>• Distribute weight evenly side-to-side</p>
                <p>• Secure with straps every 10 feet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}