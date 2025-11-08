import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, CheckCircle, Truck } from "lucide-react";

const statusColors = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  expired: "bg-slate-100 text-slate-700 border-slate-300",
  converted: "bg-blue-100 text-blue-700 border-blue-300"
};

export default function QuotesList({ quotes, isLoading, onEdit, onConvertToLoad }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-600">Loading quotes...</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No quotes found. Create your first quote to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    {quote.quote_number || `Quote #${quote.id.slice(0, 8)}`}
                  </h4>
                  <Badge className="mt-1 bg-indigo-100 text-indigo-700">{quote.mode}</Badge>
                </div>
                <Badge variant="outline" className={`${statusColors[quote.status]} border font-medium capitalize`}>
                  {quote.status}
                </Badge>
              </div>

              <div className="mb-4 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Pickup</p>
                      <p className="font-semibold text-slate-900">
                        {quote.pickup_location?.city}, {quote.pickup_location?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-slate-600 text-right">Dropoff</p>
                      <p className="font-semibold text-slate-900 text-right">
                        {quote.dropoff_location?.city}, {quote.dropoff_location?.state}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {quote.commodity && (
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Commodity</p>
                    <p className="font-medium text-slate-900">{quote.commodity}</p>
                  </div>
                )}
                {quote.weight && (
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Weight</p>
                    <p className="font-medium text-slate-900">{quote.weight.toLocaleString()} lbs</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Quoted Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${quote.quoted_rate?.toLocaleString() || 'TBD'}
                    </p>
                  </div>
                  {quote.margin && (
                    <div className="text-right">
                      <p className="text-xs text-slate-600 mb-1">Margin</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ${quote.margin.toLocaleString()}
                      </p>
                      {quote.margin_percentage && (
                        <p className="text-xs text-slate-600">
                          {quote.margin_percentage.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onEdit(quote)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {quote.status === 'accepted' && !quote.converted_to_load_id && (
                  <Button
                    onClick={() => onConvertToLoad(quote)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Convert to Load
                  </Button>
                )}
                {quote.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-300 text-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}