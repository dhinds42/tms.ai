import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Download, TrendingUp } from "lucide-react";

export default function TMSMarketplace() {
  const apps = [
    { name: 'Samsara ELD', category: 'Telematics', price: 'Free', rating: 4.8, installs: 1234 },
    { name: 'Fuel Card Pro', category: 'Fuel', price: '$29/mo', rating: 4.5, installs: 890 },
    { name: 'Insurance Hub', category: 'Insurance', price: 'Free', rating: 4.9, installs: 2100 },
    { name: 'Advanced Analytics', category: 'Analytics', price: '$49/mo', rating: 4.7, installs: 567 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            TMS Marketplace
          </h1>
          <p className="text-slate-600 mt-2">Third-party app integrations (ELD, fuel cards, insurance)</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Apps</p>
                  <p className="text-3xl font-bold text-indigo-600">{apps.length}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Installed</p>
                  <p className="text-3xl font-bold text-emerald-600">2</p>
                </div>
                <Download className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Top Rated</p>
                  <p className="text-3xl font-bold text-amber-600">4.8★</p>
                </div>
                <Star className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Growth</p>
                  <p className="text-3xl font-bold text-blue-600">+15%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {apps.map(app => (
            <Card key={app.name} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{app.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">{app.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{app.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{app.price}</p>
                    <p className="text-sm text-slate-600">{app.installs.toLocaleString()} installs</p>
                  </div>
                  <Button className="bg-indigo-600">Install</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}