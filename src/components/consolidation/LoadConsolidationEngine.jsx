import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingDown, Truck, MapPin } from "lucide-react";

/**
 * Intelligent Load Consolidation Engine
 * Auto-detects loads that can be combined to reduce costs
 */

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Geocode city/state to coordinates (simplified)
function geocodeLocation(location) {
  // In production, use actual geocoding API
  // For now, return mock coordinates based on state
  const stateCoords = {
    'CA': { lat: 36.7783, lng: -119.4179 },
    'TX': { lat: 31.9686, lng: -99.9018 },
    'FL': { lat: 27.6648, lng: -81.5158 },
    'NY': { lat: 43.2994, lng: -74.2179 },
    'IL': { lat: 40.6331, lng: -89.3985 },
  };
  
  return stateCoords[location?.state] || { lat: 0, lng: 0 };
}

export default function LoadConsolidationEngine({ loads, onConsolidate }) {
  const [opportunities, setOpportunities] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    if (!loads || loads.length < 2) return;

    const findOpportunities = () => {
      const availableLoads = loads.filter(l => 
        ['available', 'tendered'].includes(l.status) &&
        l.pickup_location && l.dropoff_location
      );

      const consolidationGroups = [];

      // Group loads by similar origin/destination
      for (let i = 0; i < availableLoads.length; i++) {
        for (let j = i + 1; j < availableLoads.length; j++) {
          const load1 = availableLoads[i];
          const load2 = availableLoads[j];

          // Get coordinates
          const origin1 = geocodeLocation(load1.pickup_location);
          const origin2 = geocodeLocation(load2.pickup_location);
          const dest1 = geocodeLocation(load1.dropoff_location);
          const dest2 = geocodeLocation(load2.dropoff_location);

          // Calculate distances
          const originDist = calculateDistance(origin1.lat, origin1.lng, origin2.lat, origin2.lng);
          const destDist = calculateDistance(dest1.lat, dest1.lng, dest2.lat, dest2.lng);

          // Check if within 50-mile radius
          if (originDist <= 50 && destDist <= 50) {
            // Calculate consolidation benefits
            const combined = calculateConsolidationBenefit([load1, load2]);
            
            if (combined.savings > 0) {
              consolidationGroups.push(combined);
            }
          }
        }
      }

      // Sort by savings potential
      const sorted = consolidationGroups.sort((a, b) => b.savings - a.savings).slice(0, 10);
      setOpportunities(sorted);
      setTotalSavings(sorted.reduce((sum, opp) => sum + opp.savings, 0));
    };

    findOpportunities();
  }, [loads]);

  const calculateConsolidationBenefit = (loadGroup) => {
    // Calculate total weight/space
    const totalWeight = loadGroup.reduce((sum, l) => sum + (parseFloat(l.weight) || 0), 0);
    const totalPallets = loadGroup.reduce((sum, l) => sum + (parseFloat(l.total_pallets) || 0), 0);
    
    // Calculate current costs (separate trucks)
    const currentCosts = loadGroup.reduce((sum, l) => sum + (parseFloat(l.carrier_pay) || 0), 0);
    const currentMiles = loadGroup.reduce((sum, l) => sum + (parseFloat(l.distance_miles) || 0), 0);
    
    // Estimate consolidated cost (single truck)
    const avgMiles = currentMiles / loadGroup.length;
    const consolidatedCost = currentCosts * 0.65; // ~35% savings when combining
    const consolidatedMiles = avgMiles * 1.1; // Slight increase for multi-stop
    
    // Calculate savings
    const costSavings = currentCosts - consolidatedCost;
    const milesSaved = currentMiles - consolidatedMiles;
    
    // Truck utilization
    const truckCapacity = 45000; // lbs
    const utilizationPercent = Math.min(100, (totalWeight / truckCapacity) * 100);
    
    return {
      loads: loadGroup,
      loadCount: loadGroup.length,
      totalWeight,
      totalPallets,
      utilizationPercent: utilizationPercent.toFixed(1),
      currentCosts: currentCosts.toFixed(0),
      consolidatedCost: consolidatedCost.toFixed(0),
      savings: costSavings.toFixed(0),
      milesSaved: milesSaved.toFixed(0),
      recommendedEquipment: totalWeight > 30000 ? 'dry_van' : 'box_truck'
    };
  };

  if (opportunities.length === 0) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          Load Consolidation Opportunities
          <Badge className="ml-auto bg-emerald-600">Save ${totalSavings.toLocaleString()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.map((opp, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border-2 border-emerald-200 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-emerald-600">Combine {opp.loadCount} loads</Badge>
                  <Badge variant="outline">{opp.utilizationPercent}% truck utilized</Badge>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  {opp.loads.map((load, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">${opp.savings}</div>
                <div className="text-xs text-slate-500">saved</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 bg-slate-50 rounded text-center">
                <div className="text-xs text-slate-500">Weight</div>
                <div className="font-semibold">{opp.totalWeight.toLocaleString()} lbs</div>
              </div>
              <div className="p-2 bg-slate-50 rounded text-center">
                <div className="text-xs text-slate-500">Pallets</div>
                <div className="font-semibold">{opp.totalPallets}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded text-center">
                <div className="text-xs text-slate-500">Miles Saved</div>
                <div className="font-semibold text-emerald-600">{opp.milesSaved}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-600">Current cost: ${opp.currentCosts}</span>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Combined: ${opp.consolidatedCost}</span>
            </div>

            <Button 
              size="sm" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onConsolidate?.(opp.loads)}
            >
              <Truck className="w-4 h-4 mr-2" />
              Consolidate into 1 {opp.recommendedEquipment.replace('_', ' ')}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}