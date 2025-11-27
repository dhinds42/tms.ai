import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  Star, 
  Copy, 
  TrendingUp,
  Clock,
  MapPin,
  Lightbulb,
  RefreshCw,
  Filter,
  Zap,
  ArrowRight,
  Layers,
  Target,
  CheckCircle,
  History,
  Sparkles
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import CreateTemplateModal from "../components/templates/CreateTemplateModal";
import TemplateCard from "../components/templates/TemplateCard";

export default function LoadTemplates() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['load-templates'],
    queryFn: () => base44.entities.LoadTemplate.list('-usage_count', 100),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (templateData) => base44.entities.LoadTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-templates'] });
      setShowCreateModal(false);
      setSelectedTemplate(null);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LoadTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-templates'] });
      setSelectedTemplate(null);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.LoadTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-templates'] });
    },
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      navigate(createPageUrl('LoadBoard'));
    },
  });

  const handleCreateTemplate = (templateData) => {
    createTemplateMutation.mutate({
      ...templateData,
      mode: operatingMode,
      usage_count: 0
    });
  };

  const handleUpdateTemplate = (templateData) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ 
        id: selectedTemplate.id, 
        data: templateData 
      });
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleToggleFavorite = (template) => {
    updateTemplateMutation.mutate({
      id: template.id,
      data: { ...template, is_favorite: !template.is_favorite }
    });
  };

  const handleUseTemplate = (template) => {
    // Create a load from template
    const loadData = {
      mode: operatingMode,
      status: 'available',
      pickup_location: template.pickup_location,
      dropoff_location: template.dropoff_location,
      shipper_id: template.shipper_id,
      commodity: template.commodity,
      weight: template.weight,
      equipment_type: template.equipment_type,
      customer_rate: template.customer_rate,
      carrier_pay: template.carrier_pay,
      distance_miles: template.distance_miles,
      special_instructions: template.special_instructions,
      temperature_requirements: template.temperature_requirements,
      is_hazmat: template.is_hazmat,
      priority: template.priority,
      pickup_date: new Date().toISOString(),
      delivery_date: new Date(Date.now() + (template.transit_days || 2) * 24 * 60 * 60 * 1000).toISOString()
    };

    // Update template usage
    updateTemplateMutation.mutate({
      id: template.id,
      data: {
        ...template,
        usage_count: (template.usage_count || 0) + 1,
        last_used_date: new Date().toISOString()
      }
    });

    // Create the load
    createLoadMutation.mutate(loadData);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.commodity?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = filterTag === 'all' || 
      (filterTag === 'favorites' && template.is_favorite) ||
      template.tags?.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  const favoriteTemplates = templates.filter(t => t.is_favorite);
  const mostUsedTemplates = [...templates].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 5);
  const recentlyUsedTemplates = [...templates].filter(t => t.last_used_date).sort((a, b) => 
    new Date(b.last_used_date) - new Date(a.last_used_date)
  ).slice(0, 5);
  const allTags = [...new Set(templates.flatMap(t => t.tags || []))];
  const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
  const unusedTemplates = templates.filter(t => !t.usage_count || t.usage_count === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Load Templates
            </h1>
            <p className="text-slate-600 mt-2">
              Create and manage templates for frequently dispatched loads
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedTemplate(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Templates</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{templates.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Favorites</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{favoriteTemplates.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Uses</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recently Used</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {templates.filter(t => t.last_used_date).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search templates by name, location, or commodity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTag('all')}
                  className={filterTag === 'all' ? 'bg-indigo-50 border-indigo-300' : ''}
                >
                  All Templates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTag('favorites')}
                  className={filterTag === 'favorites' ? 'bg-amber-50 border-amber-300' : ''}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Favorites
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterTag(tag)}
                    className={filterTag === tag ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Used Templates */}
        {mostUsedTemplates.length > 0 && filterTag === 'all' && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Most Used Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {mostUsedTemplates.map(template => (
                  <div
                    key={template.id}
                    className="p-4 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{template.template_name}</h4>
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        {template.usage_count || 0}x
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{template.pickup_location?.city}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{template.dropoff_location?.city}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || filterTag !== 'all' ? 'No templates found' : 'No templates created yet'}
            </h3>
            <p className="text-slate-600">
              {searchTerm || filterTag !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Create your first load template to speed up load creation for frequently dispatched routes'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                shippers={shippers}
                onUse={handleUseTemplate}
                onEdit={(template) => {
                  setSelectedTemplate(template);
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteTemplate}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateTemplateModal
            template={selectedTemplate}
            onSave={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedTemplate(null);
            }}
            isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            operatingMode={operatingMode}
          />
        )}

      </div>
    </div>
  );
}