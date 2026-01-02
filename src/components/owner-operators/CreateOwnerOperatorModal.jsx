import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";
import { FormField } from "@/components/design-system";

export default function CreateOwnerOperatorModal({ ownerOperator, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    cdl_number: '',
    cdl_expiration: '',
    medical_card_expiration: '',
    lease_agreement_date: '',
    lease_expiration_date: '',
    equipment_owned: {
      truck_number: '',
      make_model: '',
      year: '',
      vin: ''
    },
    payment_structure: 'percentage',
    payment_rate: 75,
    fuel_card_number: '',
    home_terminal: {
      city: '',
      state: ''
    },
    status: 'pending_approval',
    notes: ''
  });

  useEffect(() => {
    if (ownerOperator) {
      setFormData({
        ...ownerOperator,
        equipment_owned: ownerOperator.equipment_owned || {
          truck_number: '',
          make_model: '',
          year: '',
          vin: ''
        },
        home_terminal: ownerOperator.home_terminal || {
          city: '',
          state: ''
        }
      });
    }
  }, [ownerOperator]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {ownerOperator ? 'Edit Owner Operator' : 'Add New Owner Operator'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              required
            >
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </FormField>

            <FormField
              label="Company Name"
            >
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </FormField>

            <FormField
              label="Email"
            >
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </FormField>

            <FormField
              label="Phone"
              required
            >
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </FormField>
          </div>

          {/* CDL Info */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">CDL Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="CDL Number"
                required
              >
                <Input
                  value={formData.cdl_number}
                  onChange={(e) => setFormData({...formData, cdl_number: e.target.value})}
                  required
                />
              </FormField>

              <FormField
                label="CDL Expiration"
              >
                <Input
                  type="date"
                  value={formData.cdl_expiration}
                  onChange={(e) => setFormData({...formData, cdl_expiration: e.target.value})}
                />
              </FormField>

              <FormField
                label="Medical Card Expiration"
              >
                <Input
                  type="date"
                  value={formData.medical_card_expiration}
                  onChange={(e) => setFormData({...formData, medical_card_expiration: e.target.value})}
                />
              </FormField>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-4">Owned Equipment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Truck Number</Label>
                <Input
                  value={formData.equipment_owned.truck_number}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_owned: {...formData.equipment_owned, truck_number: e.target.value}
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Make/Model</Label>
                <Input
                  value={formData.equipment_owned.make_model}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_owned: {...formData.equipment_owned, make_model: e.target.value}
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.equipment_owned.year}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_owned: {...formData.equipment_owned, year: parseInt(e.target.value) || ''}
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>VIN</Label>
                <Input
                  value={formData.equipment_owned.vin}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_owned: {...formData.equipment_owned, vin: e.target.value}
                  })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Payment Structure */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Payment Type"
                required
              >
                <select
                  value={formData.payment_structure}
                  onChange={(e) => setFormData({...formData, payment_structure: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="per_mile">Per Mile</option>
                  <option value="flat_rate">Flat Rate</option>
                </select>
              </FormField>

              <FormField
                label="Payment Rate"
                required
                helper={
                  formData.payment_structure === 'percentage' ? '% of load revenue' :
                  formData.payment_structure === 'per_mile' ? 'USD per mile' :
                  'USD per load'
                }
              >
                <Input
                  type="number"
                  step="0.01"
                  value={formData.payment_rate}
                  onChange={(e) => setFormData({...formData, payment_rate: parseFloat(e.target.value)})}
                  required
                  placeholder={
                    formData.payment_structure === 'percentage' ? '75.00' :
                    formData.payment_structure === 'per_mile' ? '1.50' :
                    '500.00'
                  }
                />
              </FormField>
            </div>
          </div>

          {/* Lease Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Lease Start Date"
            >
              <Input
                type="date"
                value={formData.lease_agreement_date}
                onChange={(e) => setFormData({...formData, lease_agreement_date: e.target.value})}
              />
            </FormField>

            <FormField
              label="Lease Expiration Date"
            >
              <Input
                type="date"
                value={formData.lease_expiration_date}
                onChange={(e) => setFormData({...formData, lease_expiration_date: e.target.value})}
              />
            </FormField>
          </div>

          {/* Home Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Home Terminal City"
            >
              <Input
                value={formData.home_terminal.city}
                onChange={(e) => setFormData({
                  ...formData,
                  home_terminal: {...formData.home_terminal, city: e.target.value}
                })}
              />
            </FormField>

            <FormField
              label="Home Terminal State"
            >
              <Input
                value={formData.home_terminal.state}
                onChange={(e) => setFormData({
                  ...formData,
                  home_terminal: {...formData.home_terminal, state: e.target.value}
                })}
                maxLength={2}
              />
            </FormField>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Fuel Card Number"
            >
              <Input
                value={formData.fuel_card_number}
                onChange={(e) => setFormData({...formData, fuel_card_number: e.target.value})}
              />
            </FormField>

            <FormField
              label="Status"
            >
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </FormField>
          </div>

          {/* Notes */}
          <FormField
            label="Notes"
          >
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </FormField>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : ownerOperator ? 'Update Owner Operator' : 'Add Owner Operator'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}