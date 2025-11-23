import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Edit, Trash2, Search, Filter } from "lucide-react";

export default function FuelCardManager({ fuelCards, drivers, isLoading }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FuelCard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelCards'] });
      setShowModal(false);
      setSelectedCard(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FuelCard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelCards'] });
      setShowModal(false);
      setSelectedCard(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FuelCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelCards'] });
    },
  });

  const filteredCards = fuelCards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.truck_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const FuelCardModal = () => {
    const [formData, setFormData] = useState(selectedCard || {
      card_number: '',
      rfid: '',
      driver_id: '',
      driver_name: '',
      truck_id: '',
      truck_number: '',
      provider: 'comdata',
      status: 'active',
      issue_date: '',
      expiration_date: '',
      credit_limit: 0,
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (selectedCard) {
        updateMutation.mutate({ id: selectedCard.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    };

    const handleDriverSelect = (e) => {
      const driver = drivers.find(d => d.id === e.target.value);
      setFormData({
        ...formData,
        driver_id: driver?.id || '',
        driver_name: driver?.full_name || '',
        truck_number: driver?.equipment_assigned || ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedCard ? 'Edit Fuel Card' : 'Add Fuel Card'}
            </h2>
            <button onClick={() => { setShowModal(false); setSelectedCard(null); }} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Card Number *</Label>
                <Input
                  value={formData.card_number}
                  onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label>RFID</Label>
                <Input
                  value={formData.rfid}
                  onChange={(e) => setFormData({...formData, rfid: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Driver</Label>
              <select
                value={formData.driver_id}
                onChange={handleDriverSelect}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="">Select Driver...</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Truck/Equipment</Label>
              <Input
                value={formData.truck_number}
                onChange={(e) => setFormData({...formData, truck_number: e.target.value})}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provider *</Label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="comdata">Comdata</option>
                  <option value="efs">EFS</option>
                  <option value="wex">WEX</option>
                  <option value="tcheck">TCheck</option>
                  <option value="loves">Love's</option>
                  <option value="pilot_flying_j">Pilot Flying J</option>
                  <option value="breakthrough_fuel">Breakthrough Fuel</option>
                  <option value="fleet_one">Fleet One</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Status *</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lost">Lost</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Credit Limit</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 text-white">
                {selectedCard ? 'Update' : 'Create'}
              </Button>
              <Button type="button" onClick={() => { setShowModal(false); setSelectedCard(null); }} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fuel Cards</CardTitle>
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Card #</th>
                  <th className="text-left p-3 font-semibold text-slate-700">RFID</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Driver</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Truck</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Provider</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCards.map(card => (
                  <tr key={card.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{card.card_number}</td>
                    <td className="p-3 text-slate-700">{card.rfid || '-'}</td>
                    <td className="p-3 text-slate-700">{card.driver_name || '-'}</td>
                    <td className="p-3 text-slate-700">{card.truck_number || '-'}</td>
                    <td className="p-3 text-slate-700 capitalize">{card.provider?.replace('_', ' ')}</td>
                    <td className="p-3">
                      <Badge className={
                        card.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        card.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                        card.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {card.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => { setSelectedCard(card); setShowModal(true); }}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => { if(confirm('Delete this fuel card?')) deleteMutation.mutate(card.id); }}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' ? 'No fuel cards match your filters' : 'No fuel cards added yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {showModal && <FuelCardModal />}
    </Card>
  );
}