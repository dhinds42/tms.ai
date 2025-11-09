import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  Truck,
  Search
} from "lucide-react";

export default function CarrierLaneManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock carrier lanes data
  const [carrierLanes, setCarrierLanes] = useState([
    {
      id: '1',
      carrier_name: 'ABC Transport',
      carrier_id: 'carrier_1',
      origin_city: 'Los Angeles',
      origin_state: 'CA',
      destination_city: 'Phoenix',
      destination_state: 'AZ',
      equipment_type: 'dry_van',
      rate: 1200,
      transit_days: 1,
      frequency: 'weekly',
      last_used: new Date().toISOString(),
      total_loads: 23
    },
    {
      id: '2',
      carrier_name: 'XYZ Logistics',
      carrier_id: 'carrier_2',
      origin_city: 'Dallas',
      origin_state: 'TX',
      destination_city: 'Atlanta',
      destination_state: 'GA',
      equipment_type: 'reefer',
      rate: 1800,
      transit_days: 2,
      frequency: 'daily',
      last_used: new Date(Date.now() - 86400000).toISOString(),
      total_loads: 87
    }
  ]);

  const AddLaneModal = () => {
    const [formData, setFormData] = useState({
      carrier_name: '',
      origin_city: '',
      origin_state: '',
      destination_city: '',
      destination_state: '',
      equipment_type: 'dry_van',
      rate: '',
      transit_days: '',
      frequency: 'weekly'
    });

    const handleSave = () => {
      const newLane = {
        id: Date.now().toString(),
        ...formData,
        rate: parseFloat(formData.rate),
        transit_days: parseInt(formData.transit_days),
        last_used: null,
        total_loads: 0
      };
      setCarrierLanes([...carrierLanes, newLane]);
      setShowAddModal(false);
      alert('Carrier lane added successfully');
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Add Carrier Lane</h2>
          </div>
          <div className="p-6 space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Carrier Name *</label>
              <Input
                value={formData.carrier_name}
                onChange={(e) => setFormData({...formData, carrier_name: e.target.value})}
                placeholder="ABC Transport"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Origin City *</label>
                <Input
                  value={formData.origin_city}
                  onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Origin State *</label>
                <Input
                  value={formData.origin_state}
                  onChange={(e) => setFormData({...formData, origin_state: e.target.value.toUpperCase()})}
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Destination City *</label>
                <Input
                  value={formData.destination_city}
                  onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                  placeholder="Phoenix"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Destination State *</label>
                <Input
                  value={formData.destination_state}
                  onChange={(e) => setFormData({...formData, destination_state: e.target.value.toUpperCase()})}
                  placeholder="AZ"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Equipment Type *</label>
                <select
                  value={formData.equipment_type}
                  onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="dry_van">Dry Van</option>
                  <option value="reefer">Reefer</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="step_deck">Step Deck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rate *</label>
                <Input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  placeholder="1200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Transit Days *</label>
                <Input
                  type="number"
                  value={formData.transit_days}
                  onChange={(e) => setFormData({...formData, transit_days: e.target.value})}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Lane
              </Button>
              <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const filteredLanes = carrierLanes.filter(lane =>
    searchTerm === '' ||
    lane.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lane.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lane.destination_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (laneId) => {
    if (confirm('Delete this carrier lane?')) {
      setCarrierLanes(carrierLanes.filter(l => l.id !== laneId));
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Carrier Lane Management
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Lane
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by carrier, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredLanes.map(lane => (
            <div key={lane.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-slate-900">{lane.carrier_name}</h3>
                    <Badge className="bg-blue-100 text-blue-800 capitalize">
                      {lane.equipment_type.replace('_', ' ')}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {lane.frequency}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-900">
                        {lane.origin_city}, {lane.origin_state}
                      </span>
                    </div>
                    <span className="text-slate-400">→</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-900">
                        {lane.destination_city}, {lane.destination_state}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Rate</p>
                      <p className="font-semibold text-emerald-600">${lane.rate}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Transit</p>
                      <p className="font-semibold">{lane.transit_days} days</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Total Loads</p>
                      <p className="font-semibold">{lane.total_loads}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Used</p>
                      <p className="font-semibold text-xs">
                        {lane.last_used ? new Date(lane.last_used).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(lane.id)}
                    size="sm" 
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredLanes.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No carrier lanes found</p>
            </div>
          )}
        </div>

        {showAddModal && <AddLaneModal />}

      </CardContent>
    </Card>
  );
}