import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Download, CheckCircle, AlertTriangle } from "lucide-react";

export default function AuctionDataSync({ onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);

  const syncAuctionData = async (platform) => {
    setSyncing(true);
    try {
      // Mock auction sync - in production would call actual APIs
      const mockVehicles = [
        {
          vin: `1HGBH41JXMN${Math.floor(Math.random() * 1000000)}`,
          year: 2022,
          make: 'Honda',
          model: 'Accord',
          color: 'Silver',
          condition: 'used',
          operable: true,
          lot_number: `LOT${Math.floor(Math.random() * 10000)}`,
          buyer_number: `BUY${Math.floor(Math.random() * 1000)}`,
          pickup_location_id: `${platform} Auction - Dallas TX`,
          delivery_location_id: 'TBD'
        },
        {
          vin: `1FAHP3F20CL${Math.floor(Math.random() * 1000000)}`,
          year: 2023,
          make: 'Ford',
          model: 'Fusion',
          color: 'Blue',
          condition: 'used',
          operable: true,
          lot_number: `LOT${Math.floor(Math.random() * 10000)}`,
          buyer_number: `BUY${Math.floor(Math.random() * 1000)}`,
          pickup_location_id: `${platform} Auction - Houston TX`,
          delivery_location_id: 'TBD'
        }
      ];

      // Would normally parse actual auction API response
      const imported = await Promise.all(
        mockVehicles.map(v => base44.entities.Vehicle.create({
          ...v,
          status: 'pending',
          shipment_id: null
        }))
      );

      setSyncResults({
        platform,
        imported: imported.length,
        success: true
      });

      onSyncComplete?.(imported);

    } catch (error) {
      setSyncResults({
        platform,
        imported: 0,
        success: false,
        error: error.message
      });
    } finally {
      setSyncing(false);
    }
  };

  const auctionPlatforms = [
    { id: 'manheim', name: 'Manheim', color: 'blue' },
    { id: 'copart', name: 'Copart', color: 'orange' },
    { id: 'adesa', name: 'ADESA', color: 'purple' },
    { id: 'iaai', name: 'IAAI', color: 'green' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          Auction Data Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-900">
            <strong>Auto-sync with auction platforms:</strong><br/>
            Import vehicle data automatically after purchase, eliminating manual entry
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {auctionPlatforms.map((platform) => (
            <Button
              key={platform.id}
              onClick={() => syncAuctionData(platform.name)}
              disabled={syncing}
              className={`bg-${platform.color}-600 hover:bg-${platform.color}-700 h-auto py-4`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Sync {platform.name}</span>
              </div>
            </Button>
          ))}
        </div>

        {syncResults && (
          <div className={`p-4 rounded-lg border-2 ${
            syncResults.success 
              ? 'bg-emerald-50 border-emerald-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {syncResults.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <h4 className="font-bold">
                {syncResults.platform} Sync {syncResults.success ? 'Complete' : 'Failed'}
              </h4>
            </div>
            {syncResults.success ? (
              <p className="text-sm">
                Successfully imported <strong>{syncResults.imported} vehicles</strong> from auction
              </p>
            ) : (
              <p className="text-sm text-red-800">Error: {syncResults.error}</p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}