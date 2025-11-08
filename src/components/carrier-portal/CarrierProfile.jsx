import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, FileText, Shield, Truck } from "lucide-react";

export default function CarrierProfile({ carrier }) {
  return (
    <div className="space-y-6">
      
      {/* Company Info */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Company Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">Company Name</p>
            <p className="font-semibold text-slate-900">{carrier.company_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">MC Number</p>
            <p className="font-semibold text-slate-900">{carrier.mc_number}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">DOT Number</p>
            <p className="font-semibold text-slate-900">{carrier.dot_number}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">FMCSA Rating</p>
            <Badge className="bg-emerald-100 text-emerald-700 capitalize">
              {carrier.fmcsa_safety_rating?.replace(/_/g, ' ') || 'Not Rated'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 bg-slate-50 rounded-xl">
        <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-600" />
            <span className="text-slate-900">{carrier.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-600" />
            <span className="text-slate-900">{carrier.email}</span>
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div className="p-6 bg-slate-50 rounded-xl">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          Equipment Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {carrier.equipment_types?.map((equipment, index) => (
            <Badge key={index} className="bg-indigo-100 text-indigo-700 capitalize">
              {equipment.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </div>

      {/* Insurance */}
      {carrier.insurance_expiration && (
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Insurance Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Coverage Amount</p>
              <p className="font-semibold text-slate-900">
                ${carrier.insurance_amount?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Expiration Date</p>
              <p className="font-semibold text-slate-900">
                {new Date(carrier.insurance_expiration).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}