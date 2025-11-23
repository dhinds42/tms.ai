import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Edit, Trash2, Search } from "lucide-react";

export default function TransponderManager({ transponders, drivers, isLoading }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTransponder, setSelectedTransponder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transponder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transponders'] });
      setShowModal(false);
      setSelectedTransponder(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transponder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transponders'] });
      setShowModal(false);
      setSelectedTransponder(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transponder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transponders'] });
    },
  });

  const filteredTransponders = transponders.filter(trans => {
    const matchesSearch = searchTerm === '' || 
      trans.transponder_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.truck_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trans.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const TransponderModal = () => {
    const [formData, setFormData] = useState(selectedTransponder || {
      transponder_number: '',
      driver_id: '',
      driver_name: '',
      truck_id: '',
      truck_number: '',
      provider: 'ezpass',
      transponder_type: 'toll',
      status: 'active',
      issue_date: '',
      account_number: '',
      monthly_fee: 0,
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (selectedTransponder) {
        updateMutation.mutate({ id: selectedTransponder.id, data: formData });
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
              {selectedTransponder ? 'Edit Transponder' : 'Add Transponder'}
            </h2>
            <button onClick={() => { setShowModal(false); setSelectedTransponder(null); }} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Label>Transponder Number *</Label>
              <Input
                value={formData.transponder_number}
                onChange={(e) => setFormData({...formData, transponder_number: e.target.value})}
                required
                className="mt-2"
              />
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
                  <option value="ezpass">EZ Pass</option>
                  <option value="prepass">PrePass</option>
                  <option value="bestpass">BestPass</option>
                  <option value="drivewyze">Drivewyze</option>
                  <option value="bypass">Bypass</option>
                  <option value="norpass">NorPass</option>
                  <option value="ktag">K-TAG</option>
                  <option value="ipass">I-PASS</option>
                  <option value="sunpass">SunPass</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Type *</Label>
                <select
                  value={formData.transponder_type}
                  onChange={(e) => setFormData({...formData, transponder_type: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="toll">Toll</option>
                  <option value="weigh_station">Weigh Station</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <option value="damaged">Damaged</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Account Number</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Monthly Fee</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({...formData, monthly_fee: parseFloat(e.target.value) || 0})}
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
              <Button type="submit" className="flex-1 bg-purple-600 text-white">
                {selectedTransponder ? 'Update' : 'Create'}
              </Button>
              <Button type="button" onClick={() => { setShowModal(false); setSelectedTransponder(null); }} variant="outline" className="flex-1">
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
          <CardTitle>Transponders</CardTitle>
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 text-white">
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
                placeholder="Search transponders..."
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
              <option value="damaged">Damaged</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Transponder #</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Driver</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Truck</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Provider</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Type</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransponders.map(trans => (
                  <tr key={trans.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{trans.transponder_number}</td>
                    <td className="p-3 text-slate-700">{trans.driver_name || '-'}</td>
                    <td className="p-3 text-slate-700">{trans.truck_number || '-'}</td>
                    <td className="p-3 text-slate-700 capitalize">{trans.provider?.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-700 capitalize">{trans.transponder_type?.replace('_', ' ')}</td>
                    <td className="p-3">
                      <Badge className={
                        trans.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        trans.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                        trans.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {trans.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => { setSelectedTransponder(trans); setShowModal(true); }}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => { if(confirm('Delete this transponder?')) deleteMutation.mutate(trans.id); }}
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

          {filteredTransponders.length === 0 && (
            <div className="text-center py-12">
              <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' ? 'No transponders match your filters' : 'No transponders added yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {showModal && <TransponderModal />}
    </Card>
  );
}