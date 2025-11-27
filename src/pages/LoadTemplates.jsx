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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Load Templates</h1>
              <p className="text-xs text-slate-500">
                {templates.length} templates • {totalUsage} total uses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedTemplate(null);
                setShowCreateModal(true);
              }}
              size="sm"
              className="h-8 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Template
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['load-templates'] })}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-500">Total</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{templates.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-amber-100" onClick={() => setFilterTag('favorites')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">Favorites</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{favoriteTemplates.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">Uses</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{totalUsage}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">Recent</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{recentlyUsedTemplates.length}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-medium text-slate-500">Unused</span>
                </div>
                <p className="text-lg font-bold text-slate-600">{unusedTemplates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Quick Access & Favorites */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* Search */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filter Tags */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5 text-slate-600" />
                  Filter by Tag
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterTag('all')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      filterTag === 'all' ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-medium ${filterTag === 'all' ? 'text-indigo-700' : 'text-slate-700'}`}>All Templates</span>
                    <Badge variant="secondary" className="text-xs">{templates.length}</Badge>
                  </button>
                  <button
                    onClick={() => setFilterTag('favorites')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      filterTag === 'favorites' ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className={`font-medium ${filterTag === 'favorites' ? 'text-amber-700' : 'text-slate-700'}`}>Favorites</span>
                    </span>
                    <Badge variant="secondary" className="text-xs text-amber-600">{favoriteTemplates.length}</Badge>
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        filterTag === tag ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-medium ${filterTag === tag ? 'text-blue-700' : 'text-slate-700'}`}>{tag}</span>
                      <Badge variant="secondary" className="text-xs">{templates.filter(t => t.tags?.includes(tag)).length}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recently Used */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Recently Used
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[200px] overflow-y-auto">
                {recentlyUsedTemplates.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No recent usage</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentlyUsedTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template)}
                        className="w-full text-left p-2 bg-slate-50 rounded-lg text-xs hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900 truncate mb-0.5">{template.template_name}</div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="truncate">{template.pickup_location?.city} → {template.dropoff_location?.city}</span>
                          <span>{template.last_used_date ? format(new Date(template.last_used_date), 'MMM d') : ''}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Templates */}
          <div className="lg:col-span-6 space-y-3">
            
            {/* Most Used - Compact */}
            {mostUsedTemplates.length > 0 && filterTag === 'all' && !searchTerm && (
              <Card className="border border-indigo-200 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardHeader className="py-2.5 px-3 border-b border-indigo-200 bg-indigo-100/50">
                  <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Most Used Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mostUsedTemplates.slice(0, 3).map(template => (
                      <div
                        key={template.id}
                        className="p-2.5 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <h4 className="font-semibold text-slate-900 text-xs truncate flex-1">{template.template_name}</h4>
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs ml-1 px-1 py-0">
                            {template.usage_count || 0}x
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{template.pickup_location?.city}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{template.dropoff_location?.city}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-6 text-xs bg-indigo-600 hover:bg-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Quick Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-600">{filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}</span>
              {(searchTerm || filterTag !== 'all') && (
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setSearchTerm(''); setFilterTag('all'); }}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="mt-3 text-sm text-slate-600">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card className="border border-dashed border-slate-300 shadow-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">
                    {searchTerm || filterTag !== 'all' ? 'No templates found' : 'No templates yet'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {searchTerm || filterTag !== 'all'
                      ? 'Try adjusting your search or filters' 
                      : 'Create your first template to speed up load creation'}
                  </p>
                  {!searchTerm && filterTag === 'all' && (
                    <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-1" />
                      Create Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          {/* Right Sidebar - AI Recommendations */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* AI Recommendations */}
            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="py-2.5 px-3 border-b border-purple-200 bg-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                
                {/* Template Organization */}
                <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <p className="font-semibold text-indigo-900">Organization Tip</p>
                  </div>
                  <p className="text-indigo-700">Use tags to organize templates by customer, lane, or equipment type</p>
                </div>

                {/* Efficiency Tip */}
                <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Efficiency</p>
                  </div>
                  <p className="text-emerald-700">Templates save 70% time vs manual entry for recurring lanes</p>
                </div>

                {/* Best Practice */}
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-900">Best Practice</p>
                  </div>
                  <p className="text-blue-700">Include special instructions and accessorials in templates</p>
                </div>

                {/* Rate Updates */}
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                    <p className="font-semibold text-amber-900">Rate Updates</p>
                  </div>
                  <p className="text-amber-700">Review template rates quarterly to stay competitive</p>
                </div>

                {/* Favorites Tip */}
                <div className="p-2 bg-white rounded-lg border border-purple-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3 h-3 text-purple-600" />
                    <p className="font-semibold text-purple-900">Favorites</p>
                  </div>
                  <p className="text-purple-700">Star your top 5 templates for quick access</p>
                </div>

                {/* Automation */}
                <div className="p-2 bg-white rounded-lg border border-cyan-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <p className="font-semibold text-cyan-900">Automation</p>
                  </div>
                  <p className="text-cyan-700">Create templates for recurring shipments to auto-dispatch</p>
                </div>
              </CardContent>
            </Card>

            {/* Template Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  Template Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-700">Avg Uses/Template</span>
                    <span className="font-bold text-emerald-600">
                      {templates.length > 0 ? (totalUsage / templates.length).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">With Tags</span>
                    <span className="font-bold text-blue-600">
                      {templates.filter(t => t.tags?.length > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-amber-700">Never Used</span>
                    <span className="font-bold text-amber-600">{unusedTemplates.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Quick Actions</p>
                <div className="space-y-1.5">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-3 h-3 mr-1.5 text-indigo-600" />
                    Create New Template
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => setFilterTag('favorites')}
                  >
                    <Star className="w-3 h-3 mr-1.5 text-amber-600" />
                    View Favorites
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => navigate(createPageUrl('LoadBoard'))}
                  >
                    <ArrowRight className="w-3 h-3 mr-1.5 text-blue-600" />
                    Go to Load Board
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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