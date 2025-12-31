import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, TrendingUp, Truck } from "lucide-react";

/**
 * Predictive Capacity Crunch Alerts
 * Detects when load volume exceeds available driver capacity
 */

export default function PredictiveCapacityCrunch({ loads, drivers }) {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!loads || !drivers) return;
    
    analyzeCapacity();
  }, [loads, drivers]);

  const analyzeCapacity = () => {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Get loads in next 48 hours
    const upcomingLoads = loads.filter(load => {
      if (!load.pickup_date) return false;
      const pickupDate = new Date(load.pickup_date);
      return pickupDate >= now && pickupDate <= next48Hours && 
             ['available', 'tendered'].includes(load.status);
    });

    // Get available drivers
    const availableDrivers = drivers.filter(d => 
      ['available', 'on_duty'].includes(d.driver_status) &&
      d.hos_remaining >= 8 // At least 8 hours of driving time
    );

    // Calculate capacity gap
    const capacityNeeded = upcomingLoads.length;
    const capacityAvailable = availableDrivers.length;
    const capacityShortfall = capacityNeeded - capacityAvailable;

    if (capacityShortfall > 0) {
      // Calculate revenue at risk
      const revenueAtRisk = upcomingLoads
        .slice(0, capacityShortfall)
        .reduce((sum, load) => sum + (parseFloat(load.customer_rate) || 0), 0);

      // Determine when capacity crunch hits
      const firstLoadDate = new Date(Math.min(
        ...upcomingLoads.map(l => new Date(l.pickup_date))
      ));
      const daysUntil = Math.ceil((firstLoadDate - now) / (1000 * 60 * 60 * 24));
      const dayOfWeek = firstLoadDate.toLocaleDateString('en-US', { weekday: 'long' });

      setAlert({
        severity: capacityShortfall >= 5 ? 'critical' : 'warning',
        shortfall: capacityShortfall,
        loadsAtRisk: capacityShortfall,
        revenueAtRisk: revenueAtRisk.toFixed(0),
        daysUntil,
        dayOfWeek,
        recommendations: generateRecommendations(capacityShortfall, availableDrivers)
      });
    } else {
      setAlert(null);
    }
  };

  const generateRecommendations = (shortfall, availableDrivers) => {
    const recommendations = [];

    // Suggest broker network
    if (shortfall >= 3) {
      recommendations.push({
        type: 'broker_network',
        title: 'Post to Broker Network',
        description: `Share ${shortfall} loads with your broker network partners`,
        priority: 'high'
      });
    }

    // Suggest owner operators
    if (shortfall >= 2) {
      recommendations.push({
        type: 'owner_operator',
        title: 'Contact Owner Operators',
        description: 'Reach out to your approved owner-operator pool',
        priority: 'high'
      });
    }

    // Suggest overtime for current drivers
    const eligibleForOT = availableDrivers.filter(d => d.hos_remaining >= 10).length;
    if (eligibleForOT > 0 && shortfall <= 2) {
      recommendations.push({
        type: 'overtime',
        title: 'Offer Overtime',
        description: `${eligibleForOT} drivers eligible for extended shifts`,
        priority: 'medium'
      });
    }

    // Suggest external carriers
    recommendations.push({
      type: 'external_carrier',
      title: 'Book External Carriers',
      description: 'Use your approved carrier network',
      priority: shortfall >= 5 ? 'critical' : 'medium'
    });

    return recommendations;
  };

  if (!alert) return null;

  return (
    <Card className={`border-2 ${
      alert.severity === 'critical' 
        ? 'border-red-500 bg-red-50' 
        : 'border-amber-500 bg-amber-50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${
            alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
          }`} />
          Capacity Crunch Alert
          <Badge className={alert.severity === 'critical' ? 'ml-auto bg-red-600' : 'ml-auto bg-amber-600'}>
            {alert.severity.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Alert Message */}
        <div className="p-4 bg-white rounded-lg border-2 border-red-200">
          <p className="text-lg font-bold text-red-900 mb-2">
            Need {alert.shortfall} more driver{alert.shortfall > 1 ? 's' : ''} by {alert.dayOfWeek}
          </p>
          <p className="text-sm text-red-700">
            Or risk missing {alert.loadsAtRisk} loads = ${parseInt(alert.revenueAtRisk).toLocaleString()} revenue loss
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-900">Capacity Gap</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{alert.shortfall}</div>
            <div className="text-xs text-slate-600">drivers short</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Suggested Actions:</p>
          {alert.recommendations.map((rec, i) => (
            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{rec.title}</span>
                    <Badge className={
                      rec.priority === 'critical' ? 'bg-red-600' :
                      rec.priority === 'high' ? 'bg-amber-600' : 'bg-blue-600'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{rec.description}</p>
                </div>
                <Button size="sm" className="ml-2">
                  {rec.type === 'broker_network' && <TrendingUp className="w-4 h-4 mr-1" />}
                  {rec.type === 'owner_operator' && <Users className="w-4 h-4 mr-1" />}
                  {rec.type === 'external_carrier' && <Truck className="w-4 h-4 mr-1" />}
                  Action
                </Button>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}