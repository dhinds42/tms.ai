import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Plus,
  Star,
  Edit,
  Trash2,
  Play,
  Save,
  Filter,
  Calendar,
  MapPin,
  Truck,
  DollarSign
} from "lucide-react";

export default function SavedSearches() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const queryClient = useQueryClient();

  // Mock saved searches - in production, fetch from database
  const [savedSearches, setSavedSearches] = useState([
    {
      id: '1',
      name: 'Overdue Deliveries',
      description: 'All shipments past delivery date',
      filters: {
        status: ['in_transit', 'picked_up'],
        delivery_date: { operator: 'before', value: new Date() }
      },
      is_favorite: true,
      created_by: 'john@example.com',
      last_run: new Date().toISOString(),
      result_count: 23
    },
    {
      id: '2',
      name: 'California Pickups This Week',
      description: 'All loads picking up in CA this week',
      filters: {
        pickup_state: 'CA',
        pickup_date: { operator: 'this_week' }
      },
      is_favorite: false,
      created_by: 'sarah@example.com',
      last_run: new Date(Date.now() - 3600000).toISOString(),
      result_count: 87
    },
    {
      id: '3',
      name: 'High Value Reefer Loads',
      description: 'Reefer loads over $2000',
      filters: {
        equipment_type: 'reefer',
        customer_rate: { operator: 'greater_than', value: 2000 }
      },
      is_favorite: true,
      created_by: 'john@example.com',
      last_run: new Date(Date.now() - 7200000).toISOString(),
      result_count: 34
    }
  ]);

  const CreateSearchModal = () => {
    const [formData, setFormData] = useState(selectedSearch || {
      name: '',
      description: '',
      filters: {
        status: [],
        equipment_type: '',
        pickup_state: '',
        delivery_state: '',
        date_range: '',
        customer_rate_min: '',
        customer_rate_max: ''
      },
      is_favorite: false
    });

    const handleSave = () => {
      if (selectedSearch) {
        setSavedSearches(savedSearches.map(s => s.id === selectedSearch.id ? {...formData, id: selectedSearch.id} : s));
        alert('Saved search updated');
      } else {
        const newSearch = {
          id: Date.now().toString(),
          ...formData,
          created_by: 'current_user@example.com',
          last_run: null,
          result_count: 0
        };
        setSavedSearches([...savedSearches, newSearch]);
        alert('Saved search created');
      }
      setShowCreateModal(false);
      setSelectedSearch(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedSearch ? 'Edit Saved Search' : 'Create Saved Search'}
            </h2>
            <button onClick={() => {
              setShowCreateModal(false);
              setSelectedSearch(null);
            }} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Overdue California Loads"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this search"
              />
            </div>

            {/* Filters */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-4">
              <h3 className="font-bold text-slate-900 mb-3">Search Filters</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Equipment Type</label>
                  <select
                    value={formData.filters.equipment_type}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, equipment_type: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">All Equipment</option>
                    <option value="dry_van">Dry Van</option>
                    <option value="reefer">Reefer</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="step_deck">Step Deck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                  <select
                    value={formData.filters.date_range}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, date_range: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Any Date</option>
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pickup State</label>
                  <Input
                    value={formData.filters.pickup_state}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, pickup_state: e.target.value.toUpperCase()}
                    })}
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery State</label>
                  <Input
                    value={formData.filters.delivery_state}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, delivery_state: e.target.value.toUpperCase()}
                    })}
                    placeholder="TX"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min Rate</label>
                  <Input
                    type="number"
                    value={formData.filters.customer_rate_min}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, customer_rate_min: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Max Rate</label>
                  <Input
                    type="number"
                    value={formData.filters.customer_rate_max}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: {...formData.filters, customer_rate_max: e.target.value}
                    })}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['available', 'dispatched', 'in_transit', 'delivered', 'cancelled'].map(status => (
                    <label key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatuses = e.target.checked
                            ? [...formData.filters.status, status]
                            : formData.filters.status.filter(s => s !== status);
                          setFormData({
                            ...formData,
                            filters: {...formData.filters, status: newStatuses}
                          });
                        }}
                      />
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Favorite */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({...formData, is_favorite: e.target.checked})}
              />
              <Star className={`w-4 h-4 ${formData.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span className="text-sm text-slate-700">Add to favorites</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                {selectedSearch ? 'Update Search' : 'Save Search'}
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedSearch(null);
                }}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleRunSearch = (search) => {
    alert(`Running search: ${search.name}\n\nFilters applied:\n${JSON.stringify(search.filters, null, 2)}\n\nFound ${search.result_count} results`);
    // In production, navigate to LoadBoard with filters applied
  };

  const handleToggleFavorite = (searchId) => {
    setSavedSearches(savedSearches.map(s => 
      s.id === searchId ? {...s, is_favorite: !s.is_favorite} : s
    ));
  };

  const handleDelete = (searchId) => {
    if (confirm('Delete this saved search?')) {
      setSavedSearches(savedSearches.filter(s => s.id !== searchId));
    }
  };

  const favoriteSearches = savedSearches.filter(s => s.is_favorite);
  const allSearches = savedSearches;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Saved Searches
            </h1>
            <p className="text-slate-600 mt-2">
              Save and quickly access your most common shipment searches
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Saved Search
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Searches</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{savedSearches.length}</p>
                </div>
                <Search className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Favorites</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{favoriteSearches.length}</p>
                </div>
                <Star className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Results</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {savedSearches.reduce((sum, s) => sum + s.result_count, 0)}
                  </p>
                </div>
                <Filter className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Searches */}
        {favoriteSearches.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Favorite Searches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteSearches.map(search => (
                <Card key={search.id} className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-900">{search.name}</h3>
                      <button 
                        onClick={() => handleToggleFavorite(search.id)}
                        className="text-amber-500"
                      >
                        <Star className="w-5 h-5 fill-amber-500" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{search.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-blue-100 text-blue-800">
                        {search.result_count} results
                      </Badge>
                      {search.last_run && (
                        <span className="text-xs text-slate-500">
                          Last run: {new Date(search.last_run).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleRunSearch(search)}
                        size="sm"
                        className="flex-1 bg-blue-600 text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedSearch(search);
                          setShowCreateModal(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Searches */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">All Saved Searches</h2>
          <div className="space-y-3">
            {allSearches.map(search => (
              <Card key={search.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{search.name}</h3>
                        <button 
                          onClick={() => handleToggleFavorite(search.id)}
                          className={search.is_favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}
                        >
                          <Star className={`w-5 h-5 ${search.is_favorite ? 'fill-amber-500' : ''}`} />
                        </button>
                        <Badge className="bg-blue-100 text-blue-800">
                          {search.result_count} results
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{search.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {search.filters.equipment_type && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Truck className="w-3 h-3 mr-1" />
                            {search.filters.equipment_type}
                          </Badge>
                        )}
                        {search.filters.pickup_state && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            <MapPin className="w-3 h-3 mr-1" />
                            Pickup: {search.filters.pickup_state}
                          </Badge>
                        )}
                        {search.filters.date_range && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            {search.filters.date_range.replace('_', ' ')}
                          </Badge>
                        )}
                        {search.filters.customer_rate_min && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${search.filters.customer_rate_min}+
                          </Badge>
                        )}
                      </div>
                      {search.last_run && (
                        <p className="text-xs text-slate-500 mt-3">
                          Last run: {new Date(search.last_run).toLocaleString()} by {search.created_by}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        onClick={() => handleRunSearch(search)}
                        size="sm"
                        className="bg-blue-600 text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedSearch(search);
                          setShowCreateModal(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(search.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {showCreateModal && <CreateSearchModal />}

      </div>
    </div>
  );
}