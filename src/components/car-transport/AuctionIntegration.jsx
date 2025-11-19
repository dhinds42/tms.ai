import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, DollarSign } from "lucide-react";

export default function AuctionIntegration({ onVehiclesImported }) {
  const [auctionData, setAuctionData] = useState({
    auction_name: "",
    location: "",
    sale_date: ""
  });
  const [vehicles, setVehicles] = useState([]);

  const mockAuctionImport = () => {
    // Simulated auction import - in production would integrate with:
    // - Manheim
    // - Copart
    // - ADESA
    // - IAA
    
    const imported = [
      {
        vin: "1HGBH41JXMN109186",
        lot_number: "34567",
        year: 2021,
        make: "Honda",
        model: "Accord",
        buyer_number: "12345",
        sale_price: 18500,
        condition: "used",
        operable: true
      },
      {
        vin: "1FTEW1EP8KKE12345",
        lot_number: "34568",
        year: 2019,
        make: "Ford",
        model: "F-150",
        buyer_number: "12346",
        sale_price: 28900,
        condition: "used",
        operable: true
      },
      {
        vin: "5YFBURHE5HP123456",
        lot_number: "34569",
        year: 2020,
        make: "Toyota",
        model: "Corolla",
        buyer_number: "12347",
        sale_price: 16200,
        condition: "used",
        operable: false
      }
    ];

    setVehicles(imported);
    onVehiclesImported?.(imported);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5 text-orange-600" />
          Auction Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-900">
            <strong>Supported Auction Houses:</strong><br/>
            Manheim, Copart, ADESA, IAA, and regional auction facilities
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Auction Name</Label>
            <Input
              value={auctionData.auction_name}
              onChange={(e) => setAuctionData({...auctionData, auction_name: e.target.value})}
              placeholder="Manheim Dallas"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={auctionData.location}
              onChange={(e) => setAuctionData({...auctionData, location: e.target.value})}
              placeholder="Dallas, TX"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Sale Date</Label>
            <Input
              type="date"
              value={auctionData.sale_date}
              onChange={(e) => setAuctionData({...auctionData, sale_date: e.target.value})}
              className="mt-2"
            />
          </div>
        </div>

        <Button onClick={mockAuctionImport} className="w-full bg-orange-600">
          Import Auction Vehicles
        </Button>

        {vehicles.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="font-semibold">Imported Vehicles ({vehicles.length})</h4>
            {vehicles.map((vehicle, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    <p className="text-xs text-slate-600">VIN: {vehicle.vin} | Lot: {vehicle.lot_number}</p>
                    <p className="text-xs text-slate-600">Buyer: {vehicle.buyer_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">${vehicle.sale_price.toLocaleString()}</p>
                    <Badge className={vehicle.operable ? 'bg-emerald-600' : 'bg-red-600'}>
                      {vehicle.operable ? 'Running' : 'Non-Running'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}