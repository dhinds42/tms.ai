import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Truck, Ship, Plane, Train } from "lucide-react";

export default function CustomerLaneManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLane, setEditingLane] = useState(null);
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 100),
    initialData: []
  });

  const { data: lanes } = useQuery({
    queryKey: ['lanes'],
    queryFn: () => base44.entities.Lane.list('-created_date', 200),
    initialData: []
  });

  const createLaneMutation = useMutation({
    mutationFn: (laneData) => base44.entities.Lane.create(laneData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
      setShowCreateModal(false);
      setEditingLane(null);
    }
  });

  const updateLaneMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lane.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
      setEditingLane(null);
    }
  });

  const deleteLaneMutation = useMutation({
    mutationFn: (id) => base44.entities.Lane.update(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    }
  });

  const getModeIcon = (mode) => {
    const icons = {
      TRUCK: <Truck className="w-4 h-4" />,
      RAIL: <Train className="w-4 h-4" />,
      OCEAN: <Ship className="w-4 h-4" />,
      AIR: <Plane className="w-4 h-4" />,
      BARGE: <Ship className="w-4 h-4" />
    };
    return icons[mode] || <MapPin className="w-4 h-4" />;
  };

  const LaneFormModal = ({ lane, onClose }) => {
    const [formData, setFormData] = useState(lane || {
      customer_id: customers[0]?.id || '',
      origin_city: '',
      origin_state: '',
      origin_zip: '',
      origin_radius_miles: 50,
      dest_city: '',
      dest_state: '',
      dest_zip: '',
      dest_radius_miles: 50,
      transport_mode: 'TRUCK',
      equipment_type: 'dry_van',
      commodity_type: '',
      typical_weight_value: 40000,
      typical_weight_unit: 'LBS',
      typical_stops_count: 2
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (lane) {
        updateLaneMutation.mutate({ id: lane.id, data: formData });
      } else {
        createLaneMutation.mutate(formData);
      }
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lane ? 'Edit Lane' : 'Create New Lane'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Customer</Label>
              <Select value={formData.customer_id} onValueChange={(val) => setFormData({...formData, customer_id: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>Customer {c.id.slice(0, 8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Origin City</Label>
                <Input value={formData.origin_city} onChange={(e) => setFormData({...formData, origin_city: e.target.value})} required />
              </div>
              <div>
                <Label>Origin State</Label>
                <Input value={formData.origin_state} onChange={(e) => setFormData({...formData, origin_state: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Destination City</Label>
                <Input value={formData.dest_city} onChange={(e) => setFormData({...formData, dest_city: e.target.value})} required />
              </div>
              <div>
                <Label>Destination State</Label>
                <Input value={formData.dest_state} onChange={(e) => setFormData({...formData, dest_state: e.target.value})} required />
              </div>
            </div>

            <div>
              <Label>Transport Mode</Label>
              <Select value={formData.transport_mode} onValueChange={(val) => setFormData({...formData, transport_mode: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="RAIL">Rail</SelectItem>
                  <SelectItem value="BARGE">Barge</SelectItem>
                  <SelectItem value="OCEAN">Ocean</SelectItem>
                  <SelectItem value="AIR">Air</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Equipment Type</Label>
              <Input value={formData.equipment_type} onChange={(e) => setFormData({...formData, equipment_type: e.target.value})} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {lane ? 'Update' : 'Create'} Lane
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Lane Management</h1>
            <p className="text-slate-600 mt-1">Manage customer shipping lanes and routes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Create Lane
          </Button>
        </div>

        <div className="grid gap-4">
          {lanes.filter(l => l.is_active).map(lane => (
            <Card key={lane.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      {getModeIcon(lane.transport_mode)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {lane.origin_city}, {lane.origin_state} → {lane.dest_city}, {lane.dest_state}
                        </h3>
                        <Badge className="bg-indigo-600">{lane.transport_mode}</Badge>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>Equipment: {lane.equipment_type}</p>
                        {lane.commodity_type && <p>Commodity: {lane.commodity_type}</p>}
                        {lane.typical_weight_value && (
                          <p>Typical Weight: {lane.typical_weight_value} {lane.typical_weight_unit}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingLane(lane)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      if (confirm('Deactivate this lane?')) {
                        deleteLaneMutation.mutate(lane.id);
                      }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showCreateModal && <LaneFormModal onClose={() => setShowCreateModal(false)} />}
        {editingLane && <LaneFormModal lane={editingLane} onClose={() => setEditingLane(null)} />}
      </div>
    </div>
  );
}