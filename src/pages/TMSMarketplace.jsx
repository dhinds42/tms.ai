import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/design-system/PageHeader";
import { 
  Store, Search, Star, Download, TrendingUp, Zap, 
  Package, BarChart2, Workflow, DollarSign, Shield 
} from "lucide-react";

export default function TMSMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['marketplaceApps'],
    queryFn: () => base44.entities.MarketplaceApp.list('-install_count', 100),
    initialData: [],
  });

  const installMutation = useMutation({
    mutationFn: async (appId) => {
      // Simulate install - would call backend API
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceApps'] });
    },
  });

  const categories = [
    { value: "all", label: "All Apps", icon: Store },
    { value: "integration", label: "Integrations", icon: Package },
    { value: "widget", label: "Widgets", icon: BarChart2 },
    { value: "report", label: "Reports", icon: BarChart2 },
    { value: "ai_assistant", label: "AI Assistants", icon: Zap },
    { value: "workflow_automation", label: "Workflows", icon: Workflow },
    { value: "pricing_tool", label: "Pricing Tools", icon: DollarSign },
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory && app.status === "approved";
  });

  const featuredApps = filteredApps.filter(app => app.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="TMS Marketplace"
        subtitle="Extend your TMS with apps, integrations, and AI tools"
        icon={Store}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="gap-2"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Apps */}
        {featuredApps.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Featured Apps
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map(app => (
                <AppCard key={app.id} app={app} onInstall={() => installMutation.mutate(app.id)} />
              ))}
            </div>
          </div>
        )}

        {/* All Apps */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">All Apps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <AppCard key={app.id} app={app} onInstall={() => installMutation.mutate(app.id)} />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No apps found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function AppCard({ app, onInstall }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.app_name} className="w-12 h-12 rounded-lg" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{app.app_name}</CardTitle>
              <p className="text-sm text-slate-500">{app.developer_name}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{app.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{app.rating?.toFixed(1) || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{app.install_count || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline">{app.category}</Badge>
          {app.pricing_model === "free" ? (
            <span className="text-sm font-semibold text-emerald-600">Free</span>
          ) : (
            <span className="text-sm font-semibold text-slate-900">
              ${(app.price_cents / 100).toFixed(2)}/{app.pricing_model}
            </span>
          )}
        </div>

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onInstall}>
          Install App
        </Button>
      </CardContent>
    </Card>
  );
}