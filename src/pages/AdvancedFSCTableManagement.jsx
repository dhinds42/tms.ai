import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, GitBranch, Calculator, FileSpreadsheet, Loader2, Copy } from "lucide-react";

export default function AdvancedFSCTableManagement() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [importData, setImportData] = useState(null);
  const [whatIfScenario, setWhatIfScenario] = useState({ miles: 500, fuel_price: 3.50 });
  const [whatIfResult, setWhatIfResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: fscTables } = useQuery({
    queryKey: ['fsc_tables'],
    queryFn: () => base44.entities.CustomerFSCTable.list('-created_date', 100),
    initialData: []
  });

  const { data: fscRows } = useQuery({
    queryKey: ['fsc_rows', selectedTable],
    queryFn: () => selectedTable ? base44.entities.CustomerFSCTableRow.filter({ fsc_table_id: selectedTable }) : [],
    initialData: [],
    enabled: !!selectedTable
  });

  const { data: versions } = useQuery({
    queryKey: ['fsc_versions', selectedTable],
    queryFn: () => selectedTable ? base44.entities.FSCTableVersion.filter({ fsc_table_id: selectedTable }) : [],
    initialData: [],
    enabled: !!selectedTable
  });

  const createVersionMutation = useMutation({
    mutationFn: (data) => base44.entities.FSCTableVersion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fsc_versions'] });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates) => {
      const results = [];
      for (const update of updates) {
        const result = await base44.entities.CustomerFSCTableRow.update(update.id, update.data);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fsc_rows'] });
    }
  });

  const exportToExcel = () => {
    if (!selectedTable || !fscRows.length) return;

    const table = fscTables.find(t => t.id === selectedTable);
    
    // Create CSV content
    const headers = table.basis_type === 'FUEL_PRICE' 
      ? ['Fuel Price Min', 'Fuel Price Max', 'Charge']
      : ['Miles Min', 'Miles Max', 'Charge'];
    
    const rows = fscRows.map(row => {
      if (table.basis_type === 'FUEL_PRICE') {
        return [
          row.fuel_price_min,
          row.fuel_price_max,
          table.charge_type === 'CPM_CENTS' ? row.cpm_cents :
          table.charge_type === 'PERCENT_BPS' ? row.percent_bps :
          row.flat_cents
        ];
      } else {
        return [
          row.miles_min,
          row.miles_max,
          table.charge_type === 'CPM_CENTS' ? row.cpm_cents :
          table.charge_type === 'PERCENT_BPS' ? row.percent_bps :
          row.flat_cents
        ];
      }
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fsc_table_${table.name.replace(/\s/g, '_')}.csv`;
    a.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const data = lines.slice(1).map(line => {
        const [min, max, charge] = line.split(',').map(v => parseFloat(v.trim()));
        return { min, max, charge };
      });
      setImportData(data);
    };
    reader.readAsText(file);
  };

  const applyImport = async () => {
    if (!importData || !selectedTable) return;

    const table = fscTables.find(t => t.id === selectedTable);
    
    // Create new rows from import
    const newRows = importData.map(row => ({
      fsc_table_id: selectedTable,
      ...(table.basis_type === 'FUEL_PRICE' 
        ? { fuel_price_min: row.min, fuel_price_max: row.max }
        : { miles_min: row.min, miles_max: row.max }),
      ...(table.charge_type === 'CPM_CENTS' 
        ? { cpm_cents: row.charge }
        : table.charge_type === 'PERCENT_BPS'
        ? { percent_bps: row.charge }
        : { flat_cents: row.charge })
    }));

    // Save as new version
    await createVersionMutation.mutateAsync({
      fsc_table_id: selectedTable,
      version_number: versions.length + 1,
      version_label: `Import ${new Date().toLocaleDateString()}`,
      rows_snapshot: newRows,
      change_summary: `Imported ${newRows.length} rows from Excel`,
      created_by_email: (await base44.auth.me()).email,
      effective_start: new Date().toISOString().split('T')[0],
      import_source: 'excel'
    });

    // Create rows
    for (const row of newRows) {
      await base44.entities.CustomerFSCTableRow.create(row);
    }

    setImportData(null);
    queryClient.invalidateQueries({ queryKey: ['fsc_rows'] });
  };

  const runWhatIfScenario = async () => {
    if (!selectedTable) return;

    const table = fscTables.find(t => t.id === selectedTable);
    const basisValue = table.basis_type === 'FUEL_PRICE' ? whatIfScenario.fuel_price : whatIfScenario.miles;
    
    const matchingRow = fscRows.find(row => {
      if (table.basis_type === 'FUEL_PRICE') {
        return basisValue >= row.fuel_price_min && basisValue <= row.fuel_price_max;
      } else {
        return basisValue >= row.miles_min && basisValue <= row.miles_max;
      }
    });

    if (matchingRow) {
      let fsc = 0;
      if (table.charge_type === 'CPM_CENTS') {
        fsc = whatIfScenario.miles * matchingRow.cpm_cents;
      } else if (table.charge_type === 'PERCENT_BPS') {
        fsc = (whatIfScenario.miles * 200 * matchingRow.percent_bps) / 10000; // Assume $2/mi base
      } else {
        fsc = matchingRow.flat_cents;
      }

      setWhatIfResult({
        fsc_cents: fsc,
        matched_row: matchingRow,
        description: table.charge_type === 'CPM_CENTS' 
          ? `${matchingRow.cpm_cents}¢/mi × ${whatIfScenario.miles} mi = ${(fsc / 100).toFixed(2)}`
          : table.charge_type === 'PERCENT_BPS'
          ? `${(matchingRow.percent_bps / 100).toFixed(2)}% of linehaul = ${(fsc / 100).toFixed(2)}`
          : `Flat charge = ${(fsc / 100).toFixed(2)}`
      });
    } else {
      setWhatIfResult({ error: 'No matching row found' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            Advanced FSC Table Management
          </h1>
          <p className="text-slate-600 mt-1">Import/Export, Version Control, What-If Scenarios</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Table Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select FSC Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTable || ''} onValueChange={setSelectedTable}>
                <SelectTrigger><SelectValue placeholder="Choose table" /></SelectTrigger>
                <SelectContent>
                  {fscTables.map(table => (
                    <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTable && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-slate-600">
                    <p><strong>Basis:</strong> {fscTables.find(t => t.id === selectedTable)?.basis_type}</p>
                    <p><strong>Charge:</strong> {fscTables.find(t => t.id === selectedTable)?.charge_type}</p>
                    <p><strong>Rows:</strong> {fscRows.length}</p>
                    <p><strong>Versions:</strong> {versions.length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="import">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" />Import/Export</TabsTrigger>
                <TabsTrigger value="versions"><GitBranch className="w-4 h-4 mr-2" />Versions</TabsTrigger>
                <TabsTrigger value="whatif"><Calculator className="w-4 h-4 mr-2" />What-If</TabsTrigger>
                <TabsTrigger value="bulk"><Copy className="w-4 h-4 mr-2" />Bulk Update</TabsTrigger>
              </TabsList>

              <TabsContent value="import">
                <Card>
                  <CardHeader>
                    <CardTitle>Import/Export FSC Table</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={exportToExcel}
                        disabled={!selectedTable || !fscRows.length}
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export to CSV
                      </Button>
                      
                      <div>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleImport}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button asChild variant="outline" className="w-full">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Import from CSV
                          </label>
                        </Button>
                      </div>
                    </div>

                    {importData && (
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold text-green-900 mb-2">
                            ✓ {importData.length} rows ready to import
                          </p>
                          <div className="space-y-1 mb-3">
                            {importData.slice(0, 3).map((row, idx) => (
                              <p key={idx} className="text-xs text-green-800">
                                {row.min} - {row.max}: {row.charge}
                              </p>
                            ))}
                            {importData.length > 3 && <p className="text-xs text-green-600">...and {importData.length - 3} more</p>}
                          </div>
                          <Button onClick={applyImport} className="w-full bg-green-600">
                            Apply Import & Create Version
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions">
                <Card>
                  <CardHeader>
                    <CardTitle>Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {versions.length === 0 ? (
                      <p className="text-sm text-slate-600">No versions yet</p>
                    ) : (
                      <div className="space-y-3">
                        {versions.map((version, idx) => (
                          <div key={version.id} className="p-3 bg-slate-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <Badge>{version.version_label || `v${version.version_number}`}</Badge>
                              {version.is_active && <Badge className="bg-green-500">ACTIVE</Badge>}
                            </div>
                            <p className="text-sm text-slate-700 mb-1">{version.change_summary}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(version.created_date).toLocaleString()} by {version.created_by_email}
                            </p>
                            {version.rows_snapshot && (
                              <p className="text-xs text-slate-600 mt-1">{version.rows_snapshot.length} rows</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whatif">
                <Card>
                  <CardHeader>
                    <CardTitle>What-If Scenario Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Miles</Label>
                        <Input 
                          type="number" 
                          value={whatIfScenario.miles}
                          onChange={(e) => setWhatIfScenario({...whatIfScenario, miles: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Fuel Price ($/gal)</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={whatIfScenario.fuel_price}
                          onChange={(e) => setWhatIfScenario({...whatIfScenario, fuel_price: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={runWhatIfScenario}
                      disabled={!selectedTable}
                      className="w-full bg-purple-600"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate FSC
                    </Button>

                    {whatIfResult && (
                      <Card className={whatIfResult.error ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
                        <CardContent className="p-4">
                          {whatIfResult.error ? (
                            <p className="text-red-900">{whatIfResult.error}</p>
                          ) : (
                            <>
                              <p className="text-3xl font-bold text-green-900 mb-2">
                                ${(whatIfResult.fsc_cents / 100).toFixed(2)}
                              </p>
                              <p className="text-sm text-green-800">{whatIfResult.description}</p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bulk">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Update</CardTitle>
                    <p className="text-sm text-slate-600">Apply percentage increase/decrease to all rows</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Adjustment (%)</Label>
                      <Input type="number" placeholder="e.g., 5 for +5%, -10 for -10%" />
                    </div>
                    <Button className="w-full" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Apply to All Rows
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}