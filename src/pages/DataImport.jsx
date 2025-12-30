import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  PlayCircle,
  Eye,
  Truck,
  Users,
  Package,
  Building,
  FileText,
  Loader
} from 'lucide-react';
import { parseCSV, dryRun, commitImport } from '@/components/import/CSVImportProcessor';

const ENTITY_CONFIGS = {
  Carrier: {
    label: 'Carriers',
    icon: Truck,
    template: '/components/import-templates/carriers_import_template.csv',
    docs: '/components/import-templates/carriers_import_fields.md',
    description: 'Import carrier/vendor records for broker operations'
  },
  Shipper: {
    label: 'Customers',
    icon: Building,
    template: '/components/import-templates/customers_import_template.csv',
    docs: '/components/import-templates/customers_import_fields.md',
    description: 'Import customer/shipper company records'
  },
  Driver: {
    label: 'Drivers',
    icon: Users,
    template: '/components/import-templates/drivers_import_template.csv',
    docs: '/components/import-templates/drivers_import_fields.md',
    description: 'Import driver records (requires carriers)'
  },
  Load: {
    label: 'Loads',
    icon: Package,
    template: '/components/import-templates/loads_import_template.csv',
    docs: '/components/import-templates/loads_import_fields.md',
    description: 'Import load/shipment records (requires customers)'
  }
};

export default function DataImport() {
  const [selectedEntity, setSelectedEntity] = useState('Carrier');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, parsing, validating, importing, complete
  const [results, setResults] = useState(null);
  const [importMode, setImportMode] = useState('upsert');
  const [strictMode, setStrictMode] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      setUploadStatus('idle');
    }
  };

  const handleDryRun = async () => {
    if (!file) return;

    setUploadStatus('parsing');
    try {
      const { rows } = await parseCSV(file);
      
      setUploadStatus('validating');
      const validationResults = await dryRun(selectedEntity, rows);
      
      setResults({
        mode: 'dry-run',
        ...validationResults
      });
      setUploadStatus('complete');
    } catch (error) {
      setResults({
        mode: 'dry-run',
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [{ row: 0, field: 'file', message: error.message }]
      });
      setUploadStatus('complete');
    }
  };

  const handleCommit = async () => {
    if (!file) return;

    setUploadStatus('parsing');
    try {
      const { rows } = await parseCSV(file);
      
      setUploadStatus('importing');
      const importResults = await commitImport(selectedEntity, rows, {
        mode: importMode,
        strict: strictMode
      });
      
      setResults({
        mode: 'commit',
        ...importResults
      });
      setUploadStatus('complete');
    } catch (error) {
      setResults({
        mode: 'commit',
        totalRows: 0,
        errors: [{ row: 0, field: 'import', message: error.message }]
      });
      setUploadStatus('complete');
    }
  };

  const downloadTemplate = (entityType) => {
    const config = ENTITY_CONFIGS[entityType];
    if (config && config.template) {
      window.open(config.template, '_blank');
    }
  };

  const config = ENTITY_CONFIGS[selectedEntity];
  const Icon = config?.icon || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">CSV Data Import</h1>
              <p className="text-slate-600">Bulk import carriers, customers, drivers, and loads</p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              💡 <strong>Recommended Order:</strong> Import Carriers → Customers → Drivers → Loads
            </AlertDescription>
          </Alert>
        </div>

        {/* Entity Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Entity Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ENTITY_CONFIGS).map(([key, cfg]) => {
                const EntityIcon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedEntity(key);
                      setFile(null);
                      setResults(null);
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedEntity === key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <EntityIcon className={`w-8 h-8 mb-2 ${
                      selectedEntity === key ? 'text-indigo-600' : 'text-slate-400'
                    }`} />
                    <h3 className="font-semibold text-slate-900">{cfg.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{cfg.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(selectedEntity)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(config.docs, '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-sm text-slate-500">
                  Upload your {config.label.toLowerCase()} data file
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Options */}
        {file && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Configure Import Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Import Mode
                </label>
                <div className="flex gap-2">
                  {['insert', 'upsert', 'update'].map(mode => (
                    <Button
                      key={mode}
                      variant={importMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <strong>Insert:</strong> Create new only | <strong>Upsert:</strong> Create or update | <strong>Update:</strong> Update existing only
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="strict-mode"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="strict-mode" className="text-sm text-slate-700">
                  <strong>Strict Mode</strong> - Reject entire import if any row has errors
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDryRun}
                  disabled={!file || uploadStatus === 'parsing' || uploadStatus === 'validating'}
                  className="flex-1"
                  variant="outline"
                >
                  {uploadStatus === 'parsing' || uploadStatus === 'validating' ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Dry Run (Preview)
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleCommit}
                  disabled={!file || uploadStatus === 'importing'}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {uploadStatus === 'importing' ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Commit Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Import Results - {results.mode === 'dry-run' ? 'Preview' : 'Complete'}
                </CardTitle>
                {results.mode === 'commit' && results.errors.length === 0 && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Success
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Total Rows</p>
                  <p className="text-2xl font-bold text-slate-900">{results.totalRows}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Valid</p>
                  <p className="text-2xl font-bold text-green-700">{results.validRows}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Invalid</p>
                  <p className="text-2xl font-bold text-red-700">{results.invalidRows}</p>
                </div>
                {results.mode === 'commit' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Imported</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(results.created || 0) + (results.updated || 0)}
                    </p>
                  </div>
                )}
              </div>

              {results.mode === 'commit' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                    <p className="text-xs text-emerald-600">Created</p>
                    <p className="text-xl font-bold text-emerald-700">{results.created}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-xs text-amber-600">Updated</p>
                    <p className="text-xl font-bold text-amber-700">{results.updated}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-600">Skipped</p>
                    <p className="text-xl font-bold text-slate-700">{results.skipped}</p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {results.validRows > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Success Rate</span>
                    <span className="font-medium text-slate-900">
                      {((results.validRows / results.totalRows) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(results.validRows / results.totalRows) * 100}
                    className="h-3"
                  />
                </div>
              )}

              {/* Errors */}
              {results.errors && results.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Errors ({results.errors.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {results.errors.slice(0, 20).map((error, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                        <p className="font-medium text-red-900">
                          Row {error.row} - {error.field}
                        </p>
                        <p className="text-red-700">{error.message}</p>
                      </div>
                    ))}
                    {results.errors.length > 20 && (
                      <p className="text-sm text-slate-500 text-center">
                        ... and {results.errors.length - 20} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {results.warnings && results.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-amber-700 mb-3">
                    Warnings ({results.warnings.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {results.warnings.slice(0, 10).map((warning, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                        <p className="font-medium text-amber-900">
                          Row {warning.row} - {warning.field}
                        </p>
                        <p className="text-amber-700">{warning.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {results.mode === 'commit' && results.errors.length === 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully imported {results.created} new records and updated {results.updated} existing records.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}