import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function BookShipmentModal({ order, onClose, onConfirmBooking }) {
  const [isBooking, setIsBooking] = useState(false);
  const [locationValidation, setLocationValidation] = useState({
    pickup: order.pickup_location?.address ? true : false,
    delivery: order.delivery_location?.address ? true : false
  });

  const [pickupLocation, setPickupLocation] = useState(order.pickup_location || {});
  const [deliveryLocation, setDeliveryLocation] = useState(order.delivery_location || {});

  const handleConfirmBooking = async () => {
    if (!pickupLocation.address || !deliveryLocation.address) {
      alert('Please complete all location details');
      return;
    }

    setIsBooking(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingData = {
        booking_reference: `USHIP-${Date.now()}`,
        tracking_url: `https://tracking.example.com/${Date.now()}`,
        auto_create_carrier: true
      };

      onConfirmBooking(bookingData);
    } catch (error) {
      alert('Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Book Shipment</h2>
            <p className="text-slate-600 mt-1">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" disabled={isBooking}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Summary */}
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Carrier</p>
                <p className="text-lg font-bold">{order.selected_rate?.carrier_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${order.selected_rate?.customer_rate?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Location Validation */}
          {(!locationValidation.pickup || !locationValidation.delivery) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-700 mb-2" />
              <p className="text-sm text-amber-800">Complete location details required</p>
            </div>
          )}

          {/* Pickup */}
          {!locationValidation.pickup && (
            <div className="border-2 border-emerald-200 rounded-xl p-6">
              <h3 className="font-bold mb-4">Pickup Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={pickupLocation.address || ''}
                    onChange={(e) => {
                      setPickupLocation({ ...pickupLocation, address: e.target.value });
                      setLocationValidation({ ...locationValidation, pickup: true });
                    }}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={pickupLocation.city || ''}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, city: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery */}
          {!locationValidation.delivery && (
            <div className="border-2 border-red-200 rounded-xl p-6">
              <h3 className="font-bold mb-4">Delivery Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={deliveryLocation.address || ''}
                    onChange={(e) => {
                      setDeliveryLocation({ ...deliveryLocation, address: e.target.value });
                      setLocationValidation({ ...locationValidation, delivery: true });
                    }}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={deliveryLocation.city || ''}
                    onChange={(e) => setDeliveryLocation({ ...deliveryLocation, city: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ready */}
          {locationValidation.pickup && locationValidation.delivery && (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-700 mb-2" />
              <h3 className="font-bold text-lg mb-2">Ready to Book</h3>
              <p className="text-slate-600 mb-4">All details complete</p>

              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full bg-emerald-600 text-white text-lg py-6"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm and Build Load
                  </>
                )}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}