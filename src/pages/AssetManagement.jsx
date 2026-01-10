import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  CreditCard,
  Radio,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Download
} from "lucide-react";

import FuelCardManager from "../components/assets/FuelCardManager";
import TransponderManager from "../components/assets/TransponderManager";

export default function AssetManagement() {
  const [activeTab, setActiveTab] = useState("fuel_cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: fuelCards, isLoading: fuelCardsLoading } = useScopedEntity('FuelCard', { limit: 500 });
  const { data: transponders, isLoading: transpondersLoading } = useScopedEntity('Transponder', { limit: 500 });
  const { data: drivers } = useScopedEntity('Driver', { limit: 200 });

  const stats = {
    totalFuelCards: fuelCards.length,
    activeFuelCards: fuelCards.filter(c => c.status === 'active').length,
    totalTransponders: transponders.length,
    activeTransponders: transponders.filter(t => t.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Asset Management
          </h1>
          <p className="text-slate-600 mt-2">
            Track and manage fuel cards and transponders for your fleet
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Fuel Cards</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalFuelCards}</p>
                </div>
                <CreditCard className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Fuel Cards</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.activeFuelCards}</p>
                </div>
                <CreditCard className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Transponders</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalTransponders}</p>
                </div>
                <Radio className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Transponders</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.activeTransponders}</p>
                </div>
                <Radio className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="fuel_cards" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Fuel Cards
            </TabsTrigger>
            <TabsTrigger value="transponders" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Transponders
            </TabsTrigger>
          </TabsList>

          {/* Fuel Cards Tab */}
          <TabsContent value="fuel_cards">
            <FuelCardManager
              fuelCards={fuelCards}
              drivers={drivers}
              isLoading={fuelCardsLoading}
            />
          </TabsContent>

          {/* Transponders Tab */}
          <TabsContent value="transponders">
            <TransponderManager
              transponders={transponders}
              drivers={drivers}
              isLoading={transpondersLoading}
            />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}