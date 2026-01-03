import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  Truck,
  FileText,
  DollarSign,
  Clock,
  Search,
  Archive,
  ArchiveRestore,
  Eye
} from "lucide-react";

import CreateLTLOrderModal from "../components/ltl/CreateLTLOrderModal";
import LTLOrderCard from "../components/ltl/LTLOrderCard";
import GetRatesModal from "../components/ltl/GetRatesModal";
import PricingQuoteModal from "../components/ltl/PricingQuoteModal";
import BookShipmentModal from "../components/ltl/BookShipmentModal";

export default function LTLManagement() {
  const [activeTab, setActiveTab] = useState("open");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: ltlOrders, isLoading } = useQuery({
    queryKey: ['ltl-orders'],
    queryFn: () => base44.entities.LTLOrder.list('-created_date', 200),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => {
      // Generate order number
      const existingOrders = ltlOrders.length;
      const orderNumber = `LTL-${(1000 + existingOrders).toString()}`;
      return base44.entities.LTLOrder.create({
        ...orderData,
        order_number: orderNumber,
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ltl-orders'] });
      setShowCreateModal(false);
      setSelectedOrder(null);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LTLOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ltl-orders'] });
      setSelectedOrder(null);
    },
  });

  const handleCreateOrder = (orderData) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({ id: selectedOrder.id, data: orderData });
    } else {
      createOrderMutation.mutate(orderData);
    }
  };

  const handleGetRates = (order) => {
    setSelectedOrder(order);
    setShowRatesModal(true);
  };

  const handleRateSelected = (order, rateData) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        selected_rate: rateData,
        status: 'quoted'
      }
    });
    setShowRatesModal(false);
    setSelectedOrder(order);
    setShowPricingModal(true);
  };

  const handleQuoteSent = (order, recipients) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        status: 'quote_sent',
        quote_sent_date: new Date().toISOString(),
        quote_sent_to: recipients
      }
    });
    setShowPricingModal(false);
  };

  const handleBookShipment = (order) => {
    setSelectedOrder(order);
    setShowPricingModal(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (order, bookingData) => {
    // Create load from LTL order
    const pickupDate = order.pickup_date || new Date().toISOString().split('T')[0];
    const deliveryDate = order.delivery_date || new Date().toISOString().split('T')[0];
    
    const loadData = {
      load_number: `LOAD-${order.order_number}`,
      mode: 'broker',
      status: 'booked',
      pickup_location: order.pickup_location,
      dropoff_location: order.delivery_location,
      pickup_date: pickupDate,
      delivery_date: deliveryDate,
      planned_pickup_datetime: pickupDate,
      planned_delivery_datetime: deliveryDate,
      commodity: order.commodity,
      equipment_type: 'dry_van',
      customer_rate: order.selected_rate?.customer_rate,
      carrier_pay: order.selected_rate?.carrier_cost,
      margin: order.selected_rate?.margin,
      reference_number: order.order_number,
      special_instructions: order.special_instructions
    };

    // Create load
    base44.entities.Load.create(loadData).then((load) => {
      // Update order with load reference
      updateOrderMutation.mutate({
        id: order.id,
        data: {
          ...order,
          status: 'on_load',
          load_id: load.id,
          booking_reference: bookingData.booking_reference,
          tracking_url: bookingData.tracking_url
        }
      });

      // Optionally create carrier if it doesn't exist
      if (bookingData.auto_create_carrier) {
        base44.entities.Carrier.create({
          company_name: order.selected_rate?.carrier_name,
          mc_number: 'TBD',
          dot_number: 'TBD',
          contact_name: 'LTL Carrier',
          email: 'ltl@carrier.com',
          status: 'active'
        }).then((carrier) => {
          // Update load with carrier
          base44.entities.Load.update(load.id, {
            ...load,
            carrier_id: carrier.id
          });
        });
      }

      setShowBookingModal(false);
      alert('LTL Order booked and load created successfully!');
    });
  };

  const handleArchiveOrder = (order) => {
    if (confirm('Archive this LTL order?')) {
      updateOrderMutation.mutate({
        id: order.id,
        data: {
          ...order,
          archived: true,
          status: 'archived',
          archived_date: new Date().toISOString()
        }
      });
    }
  };

  const handleUnarchiveOrder = (order) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        archived: false,
        status: order.load_id ? 'on_load' : 'draft'
      }
    });
  };

  const handleAcceptQuote = (order) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        ...order,
        status: 'quote_accepted',
        quote_accepted_date: new Date().toISOString()
      }
    });
    alert('Quote accepted! Ready to book shipment.');
  };

  const handleRejectQuote = (order) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      updateOrderMutation.mutate({
        id: order.id,
        data: {
          ...order,
          status: 'quote_rejected',
          quote_rejected_date: new Date().toISOString(),
          quote_rejection_reason: reason
        }
      });
    }
  };

  // Filter orders by tab
  const openOrders = ltlOrders.filter(o => 
    !o.archived && !o.load_id && ['draft', 'quoted', 'quote_sent', 'quote_accepted', 'quote_rejected'].includes(o.status)
  );

  const ordersOnLoad = ltlOrders.filter(o => 
    !o.archived && o.load_id && ['on_load', 'booked', 'in_transit', 'delivered'].includes(o.status)
  );

  const archivedOrders = ltlOrders.filter(o => o.archived);

  // Search filtering
  const filterOrders = (orders) => {
    if (!searchTerm) return orders;
    return orders.filter(o =>
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.commodity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.delivery_location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'open':
        return filterOrders(openOrders);
      case 'on_load':
        return filterOrders(ordersOnLoad);
      case 'archived':
        return filterOrders(archivedOrders);
      default:
        return [];
    }
  };

  const currentOrders = getCurrentOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              LTL Order Management
            </h1>
            <p className="text-slate-600 mt-2">
              Build and manage LTL orders quickly & easily - Get quotes, book shipments, and track deliveries
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedOrder(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Build an LTL Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Orders</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{openOrders.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">On Load</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{ordersOnLoad.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Quotes</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {ltlOrders.filter(o => o.status === 'quote_sent').length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${ltlOrders.reduce((sum, o) => sum + (o.selected_rate?.customer_rate || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search orders by number, commodity, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="open" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Open Orders ({openOrders.length})
            </TabsTrigger>
            <TabsTrigger value="on_load" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Orders on a Load ({ordersOnLoad.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archived ({archivedOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-slate-600">Loading LTL orders...</p>
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {activeTab === 'open' && 'No open orders'}
                  {activeTab === 'on_load' && 'No orders on loads'}
                  {activeTab === 'archived' && 'No archived orders'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {activeTab === 'open' && 'Create your first LTL order to get started'}
                  {activeTab === 'on_load' && 'Book an order to see it here'}
                  {activeTab === 'archived' && 'Archived orders will appear here'}
                </p>
                {activeTab === 'open' && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Build an LTL Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentOrders.map((order) => (
                  <LTLOrderCard
                    key={order.id}
                    order={order}
                    load={loads.find(l => l.id === order.load_id)}
                    onEdit={() => {
                      setSelectedOrder(order);
                      setShowCreateModal(true);
                    }}
                    onGetRates={() => handleGetRates(order)}
                    onViewLoad={(loadId) => {
                      // Navigate to load
                      window.location.href = `/LoadBoard?load=${loadId}`;
                    }}
                    onArchive={() => handleArchiveOrder(order)}
                    onUnarchive={() => handleUnarchiveOrder(order)}
                    onAcceptQuote={() => handleAcceptQuote(order)}
                    onRejectQuote={() => handleRejectQuote(order)}
                    onBookShipment={() => handleBookShipment(order)}
                    isArchived={activeTab === 'archived'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Order Modal */}
        {showCreateModal && (
          <CreateLTLOrderModal
            order={selectedOrder}
            onSave={handleCreateOrder}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedOrder(null);
            }}
            isLoading={createOrderMutation.isPending || updateOrderMutation.isPending}
          />
        )}

        {/* Get Rates Modal */}
        {showRatesModal && selectedOrder && (
          <GetRatesModal
            order={selectedOrder}
            onClose={() => setShowRatesModal(false)}
            onSelectRate={(rateData) => handleRateSelected(selectedOrder, rateData)}
          />
        )}

        {/* Pricing/Quote Modal */}
        {showPricingModal && selectedOrder && (
          <PricingQuoteModal
            order={selectedOrder}
            onClose={() => setShowPricingModal(false)}
            onSendQuote={(recipients) => handleQuoteSent(selectedOrder, recipients)}
            onBookShipment={() => handleBookShipment(selectedOrder)}
            onUpdateMarkup={(markupData) => {
              const updatedRate = {
                ...selectedOrder.selected_rate,
                ...markupData
              };
              updateOrderMutation.mutate({
                id: selectedOrder.id,
                data: { ...selectedOrder, selected_rate: updatedRate }
              });
            }}
          />
        )}

        {/* Book Shipment Modal */}
        {showBookingModal && selectedOrder && (
          <BookShipmentModal
            order={selectedOrder}
            onClose={() => setShowBookingModal(false)}
            onConfirmBooking={(bookingData) => handleConfirmBooking(selectedOrder, bookingData)}
          />
        )}

      </div>
    </div>
  );
}