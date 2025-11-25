import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Filter, 
  X, 
  Plus, 
  Save, 
  Trash2, 
  Calendar as CalendarIcon,
  Download,
  RotateCcw
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear } from "date-fns";

const FILTER_OPERATORS = {
  string: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_or_equal', label: 'Greater or Equal' },
    { value: 'less_or_equal', label: 'Less or Equal' },
    { value: 'between', label: 'Between' }
  ],
  date: [
    { value: 'equals', label: 'On Date' },
    { value: 'date_before', label: 'Before' },
    { value: 'date_after', label: 'After' },
    { value: 'between', label: 'Between' },
    { value: 'date_within_days', label: 'Within X Days' }
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is Not' },
    { value: 'in_list', label: 'Is One Of' },
    { value: 'not_in_list', label: 'Is Not One Of' }
  ]
};

const PRESET_DATE_RANGES = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ start: subDays(new Date(), 1), end: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Last Month', getValue: () => ({ start: startOfMonth(subDays(startOfMonth(new Date()), 1)), end: endOfMonth(subDays(startOfMonth(new Date()), 1)) }) },
  { label: 'This Quarter', getValue: () => ({ start: startOfQuarter(new Date()), end: endOfQuarter(new Date()) }) },
  { label: 'This Year', getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) }
];

export default function AdvancedAnalyticsFilters({
  fields = [],
  onFilterChange,
  onExport,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter
}) {
  const [filters, setFilters] = useState([]);
  const [filterLogic, setFilterLogic] = useState('AND');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Default fields if none provided
  const defaultFields = [
    { name: 'status', label: 'Status', type: 'select', options: ['available', 'assigned', 'dispatched', 'picked_up', 'in_transit', 'delivered', 'invoiced', 'closed', 'cancelled'] },
    { name: 'equipment_type', label: 'Equipment', type: 'select', options: ['dry_van', 'reefer', 'flatbed', 'step_deck', 'lowboy', 'tanker', 'container'] },
    { name: 'pickup_location.state', label: 'Origin State', type: 'string' },
    { name: 'dropoff_location.state', label: 'Destination State', type: 'string' },
    { name: 'customer_rate', label: 'Customer Rate', type: 'number' },
    { name: 'carrier_pay', label: 'Carrier Pay', type: 'number' },
    { name: 'margin', label: 'Margin', type: 'number' },
    { name: 'distance_miles', label: 'Distance (Miles)', type: 'number' },
    { name: 'weight', label: 'Weight (lbs)', type: 'number' },
    { name: 'pickup_date', label: 'Pickup Date', type: 'date' },
    { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
    { name: 'created_date', label: 'Created Date', type: 'date' },
    { name: 'shipper_id', label: 'Shipper', type: 'string' },
    { name: 'carrier_id', label: 'Carrier', type: 'string' },
    { name: 'driver_id', label: 'Driver', type: 'string' },
    { name: 'mode', label: 'Mode', type: 'select', options: ['carrier', 'broker'] },
    { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent', 'critical'] },
    { name: 'invoice_status', label: 'Invoice Status', type: 'select', options: ['pending', 'sent', 'partial', 'paid', 'overdue'] }
  ];

  const availableFields = fields.length > 0 ? fields : defaultFields;

  const addFilter = () => {
    setFilters([...filters, { 
      id: Date.now(), 
      field: '', 
      operator: 'equals', 
      value: '',
      value2: '' // For "between" operator
    }]);
  };

  const updateFilter = (id, updates) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setDateRange({ start: null, end: null });
  };

  const applyFilters = () => {
    const activeFilters = filters.filter(f => f.field && f.operator);
    onFilterChange?.({
      filters: activeFilters,
      logic: filterLogic,
      dateRange
    });
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    onSaveFilter?.({
      name: filterName,
      filters,
      logic: filterLogic,
      dateRange
    });
    setFilterName('');
    setShowSaveDialog(false);
  };

  const loadSavedFilter = (saved) => {
    setFilters(saved.filters || []);
    setFilterLogic(saved.logic || 'AND');
    setDateRange(saved.dateRange || { start: null, end: null });
    applyFilters();
  };

  const handleDatePreset = (preset) => {
    const range = preset.getValue();
    setDateRange(range);
  };

  const getFieldConfig = (fieldName) => {
    return availableFields.find(f => f.name === fieldName) || { type: 'string' };
  };

  const getOperatorsForField = (fieldName) => {
    const fieldConfig = getFieldConfig(fieldName);
    return FILTER_OPERATORS[fieldConfig.type] || FILTER_OPERATORS.string;
  };

  // Auto-apply filters when they change
  useEffect(() => {
    const debounce = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(debounce);
  }, [filters, filterLogic, dateRange]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Advanced Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <Badge className="bg-indigo-100 text-indigo-800">
                {filters.length} filter{filters.length !== 1 ? 's' : ''} active
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Date Range Presets */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_DATE_RANGES.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handleDatePreset(preset)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[140px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.start ? format(dateRange.start, 'MMM d, yyyy') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.start}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                />
              </PopoverContent>
            </Popover>
            <span className="text-slate-400">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[140px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.end ? format(dateRange.end, 'MMM d, yyyy') : 'End Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.end}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filter Logic Toggle */}
        {filters.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Match:</span>
            <Button
              variant={filterLogic === 'AND' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterLogic('AND')}
              className={filterLogic === 'AND' ? 'bg-indigo-600' : ''}
            >
              ALL conditions (AND)
            </Button>
            <Button
              variant={filterLogic === 'OR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterLogic('OR')}
              className={filterLogic === 'OR' ? 'bg-indigo-600' : ''}
            >
              ANY condition (OR)
            </Button>
          </div>
        )}

        {/* Active Filters */}
        <div className="space-y-3">
          {filters.map((filter, index) => {
            const fieldConfig = getFieldConfig(filter.field);
            const operators = getOperatorsForField(filter.field);

            return (
              <div key={filter.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                {index > 0 && (
                  <Badge className="bg-slate-200 text-slate-700 mr-2">
                    {filterLogic}
                  </Badge>
                )}

                {/* Field Select */}
                <Select
                  value={filter.field}
                  onValueChange={(value) => updateFilter(filter.id, { field: value, operator: 'equals', value: '' })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator Select */}
                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value Input */}
                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                  <>
                    {fieldConfig.type === 'select' && fieldConfig.options ? (
                      <Select
                        value={filter.value}
                        onValueChange={(value) => updateFilter(filter.id, { value })}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldConfig.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : fieldConfig.type === 'date' ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[140px]">
                            {filter.value ? format(new Date(filter.value), 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filter.value ? new Date(filter.value) : undefined}
                            onSelect={(date) => updateFilter(filter.id, { value: date?.toISOString() })}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        type={fieldConfig.type === 'number' ? 'number' : 'text'}
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="w-[160px]"
                      />
                    )}

                    {/* Second value for "between" operator */}
                    {filter.operator === 'between' && (
                      <>
                        <span className="text-slate-400">and</span>
                        <Input
                          type={fieldConfig.type === 'number' ? 'number' : 'text'}
                          placeholder="Value 2"
                          value={filter.value2}
                          onChange={(e) => updateFilter(filter.id, { value2: e.target.value })}
                          className="w-[160px]"
                        />
                      </>
                    )}
                  </>
                )}

                {/* Remove Filter */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add Filter Button */}
        <Button variant="outline" onClick={addFilter} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Filter
        </Button>

        {/* Saved Filters */}
        {(savedFilters.length > 0 || filters.length > 0) && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Saved Filters</span>
              {filters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(!showSaveDialog)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Current
                </Button>
              )}
            </div>

            {showSaveDialog && (
              <div className="flex items-center gap-2 mb-3">
                <Input
                  placeholder="Filter name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSaveFilter}>Save</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedFilter(saved)}
                    className="text-xs"
                  >
                    {saved.name}
                  </Button>
                  {onDeleteFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteFilter(index)}
                      className="h-7 w-7 p-0 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

// Export filter application helper
export function applyFiltersToData(data, filterConfig) {
  if (!filterConfig || !filterConfig.filters || filterConfig.filters.length === 0) {
    return data;
  }

  const { filters, logic, dateRange } = filterConfig;

  return data.filter(item => {
    // Apply date range filter first
    if (dateRange?.start || dateRange?.end) {
      const itemDate = new Date(item.created_date || item.pickup_date);
      if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
      if (dateRange.end && itemDate > new Date(dateRange.end)) return false;
    }

    // Apply field filters
    const results = filters.map(filter => {
      const value = getNestedValue(item, filter.field);
      return evaluateFilter(value, filter.operator, filter.value, filter.value2);
    });

    return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function evaluateFilter(value, operator, filterValue, filterValue2) {
  switch (operator) {
    case 'equals': return String(value).toLowerCase() === String(filterValue).toLowerCase();
    case 'not_equals': return String(value).toLowerCase() !== String(filterValue).toLowerCase();
    case 'contains': return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'not_contains': return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'starts_with': return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'ends_with': return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'is_empty': return !value || value === '';
    case 'is_not_empty': return value && value !== '';
    case 'greater_than': return Number(value) > Number(filterValue);
    case 'less_than': return Number(value) < Number(filterValue);
    case 'greater_or_equal': return Number(value) >= Number(filterValue);
    case 'less_or_equal': return Number(value) <= Number(filterValue);
    case 'between': return Number(value) >= Number(filterValue) && Number(value) <= Number(filterValue2);
    case 'in_list': return filterValue.split(',').map(s => s.trim().toLowerCase()).includes(String(value).toLowerCase());
    case 'not_in_list': return !filterValue.split(',').map(s => s.trim().toLowerCase()).includes(String(value).toLowerCase());
    case 'date_before': return new Date(value) < new Date(filterValue);
    case 'date_after': return new Date(value) > new Date(filterValue);
    case 'date_within_days': {
      const date = new Date(value);
      const now = new Date();
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= Number(filterValue);
    }
    default: return true;
  }
}