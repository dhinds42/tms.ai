import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Truck,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Search,
  Filter,
  Send,
  Eye,
  CheckCircle,
  TrendingUp,
  Users
} from "lucide-react";

export default function CompanyLoadboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  // Filter available loads for posting
  const availableLoads = loads.filter(l => 
    ['available', 'tendered'].includes(l.status)
  );

  // Posted loads
  const postedLoads = loads.filter(l => l.posted_to_loadboard);

  const filteredLoads = availableLoads.filter(load => {
    const equipmentMatch = equipmentFilter === 'all' || load.equipment_type === equipmentFilter;
    const searchMatch = searchTerm === '' ||
      load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return equipmentMatch && searchMatch;
  });

  const handlePostLoad = (load) => {
    alert(`Posting load ${load.load_number || load.id.slice(0, 8)} to company loadboard\n\nCarriers will be notified via email and can book directly through their portal.`);
    // In production: update load with posted_to_loadboard flag
  };

  const handleBulkPost = () => {
    if (selectedLoads.length === 0) {
      alert('Please select loads to post');
      return;
    }
    alert(`Posting ${selectedLoads.length} loads to company loadboard`);
    setSelectedLoads([]);
    setShowBulkActions(false);
  };

  const handleEmailCarriers = () => {
    alert(`Emailing ${carriers.length} carriers about ${selectedLoads.length} new loads on your loadboard`);
  };

  const handleSelectAll = () => {
    if (selectedLoads.length === filteredLoads.length) {
      setSelectedLoads([]);
    } else {
      setSelectedLoads(filteredLoads.map(l => l.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Company Loadboard
            </h1>
            <p className="text-slate-600 mt-2">
              Post loads to your private loadboard and allow carriers to book directly
            </p>
          </div>
          {selectedLoads.length > 0 && (
            <Button onClick={() => setShowBulkActions(!showBulkActions)} className="bg-purple-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Bulk Actions ({selectedLoads.length})
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available Loads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{availableLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-slate-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Posted</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{postedLoads.length}</p>
                </div>
                <Send className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Carrier Views</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">487</p>
                </div>
                <Eye className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Bookings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">34</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedLoads.length > 0 && (
          <Card className="border-0 shadow-xl bg-purple-50 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Bulk Actions</h3>
                  <p className="text-sm text-slate-600">{selectedLoads.length} loads selected</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkPost} className="bg-purple-600 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Post to Loadboard
                  </Button>
                  <Button onClick={handleEmailCarriers} variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Email Carriers
                  </Button>
                  <Button onClick={() => {
                    setSelectedLoads([]);
                    setShowBulkActions(false);
                  }} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by city or load number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Equipment</option>
                  <option value="dry_van">Dry Van</option>
                  <option value="reefer">Reefer</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="step_deck">Step Deck</option>
                </select>
                {filteredLoads.length > 0 && (
                  <Button onClick={handleSelectAll} variant="outline">
                    {selectedLoads.length === filteredLoads.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Loads Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Available Loads for Posting</h2>
          {filteredLoads.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white p-12 text-center">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Available Loads</h3>
              <p className="text-slate-600">All loads are either posted or not ready for posting.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLoads.map(load => (
                <Card key={load.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedLoads.includes(load.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLoads([...selectedLoads, load.id]);
                          } else {
                            setSelectedLoads(selectedLoads.filter(id => id !== load.id));
                          }
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-900">
                            {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                          </h3>
                          <Badge className="bg-slate-100 text-slate-800 capitalize">
                            {load.equipment_type?.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {load.pickup_location?.city}, {load.pickup_location?.state}
                              </p>
                              <p className="text-xs text-slate-500">
                                {load.pickup_date && new Date(load.pickup_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {load.dropoff_location?.city}, {load.dropoff_location?.state}
                              </p>
                              <p className="text-xs text-slate-500">
                                {load.delivery_date && new Date(load.delivery_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                          <div>
                            <p className="text-slate-600">Weight</p>
                            <p className="font-semibold">{load.weight || 'N/A'} lbs</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Distance</p>
                            <p className="font-semibold">{load.distance_miles || 'N/A'} mi</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Rate</p>
                            <p className="font-semibold text-emerald-600">
                              ${load.carrier_pay?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handlePostLoad(load)}
                          className="w-full bg-purple-600 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post to Loadboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Posted Loads */}
        {postedLoads.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Currently Posted Loads</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {postedLoads.slice(0, 6).map(load => (
                <Card key={load.id} className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-900">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</p>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Posted
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600 mt-2">
                      ${load.carrier_pay?.toFixed(2) || '0.00'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}