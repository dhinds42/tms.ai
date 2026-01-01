import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fuel, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function CustomerFSCTableBuilder() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 100),
    initialData: []
  });

  const { data: tables } = useQuery({
    queryKey: ['fscTables'],
    queryFn: () => base44.entities.CustomerFSCTable.list('-created_date', 100),
    initialData: []
  });

  const { data: rows } = useQuery({
    queryKey: ['fscRows', selectedTable?.id],
    queryFn: () => base44.entities.CustomerFSCTableRow.filter({ fsc_table_id: selectedTable.id }),
    initialData: [],
    enabled: !!selectedTable
  });

  const CreateTableForm = () => {
    const [formData, setFormData] = useState({
      customer_id: customers[0]?.id || '',
      name: '',
      mode_scope: 'TRUCK',
      basis_type: 'FUEL_PRICE',
      charge_type: 'CPM_CENTS',
      effective_start: new Date().toISOString().split('T')[0]
    });

    const createTableMutation = useMutation({
      mutationFn: (data) => base44.entities.CustomerFSCTable.create(data),
      onSuccess: (newTable) => {
        queryClient.invalidateQueries({ queryKey: ['fscTables'] });
        setSelectedTable(newTable);
        setShowCreateTable(false);
      }
    });

    return (
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle>Create FSC Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Table Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Standard Truck FSC 2026" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mode Scope</Label>
              <Select value={formData.mode_scope} onValueChange={(val) => setFormData({...formData, mode_scope: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="RAIL">Rail</SelectItem>
                  <SelectItem value="OCEAN">Ocean</SelectItem>
                  <SelectItem value="AIR">Air</SelectItem>
                  <SelectItem value="ALL">All Modes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Basis Type</Label>
              <Select value={formData.basis_type} onValueChange={(val) => setFormData({...formData, basis_type: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUEL_PRICE">Fuel Price Range</SelectItem>
                  <SelectItem value="DISTANCE_BAND">Distance Band</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Charge Type</Label>
            <Select value={formData.charge_type} onValueChange={(val) => setFormData({...formData, charge_type: val})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CPM_CENTS">Cents Per Mile</SelectItem>
                <SelectItem value="PERCENT_BPS">Percent of Linehaul</SelectItem>
                <SelectItem value="FLAT_CENTS">Flat Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreateTable(false)}>Cancel</Button>
            <Button onClick={() => createTableMutation.mutate(formData)} className="bg-indigo-600">
              Create Table
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AddRowForm = () => {
    const [rowData, setRowData] = useState({
      fsc_table_id: selectedTable.id,
      fuel_price_min: '',
      fuel_price_max: '',
      miles_min: '',
      miles_max: '',
      cpm_cents: '',
      percent_bps: '',
      flat_cents: ''
    });

    const createRowMutation = useMutation({
      mutationFn: (data) => base44.entities.CustomerFSCTableRow.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fscRows'] });
        setShowAddRow(false);
      }
    });

    return (
      <Card className="border-2 border-emerald-200 bg-emerald-50">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Add Table Row</h3>
          
          {selectedTable.basis_type === 'FUEL_PRICE' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fuel Price Min ($)</Label>
                <Input type="number" step="0.01" value={rowData.fuel_price_min} onChange={(e) => setRowData({...rowData, fuel_price_min: e.target.value})} required />
              </div>
              <div>
                <Label>Fuel Price Max ($)</Label>
                <Input type="number" step="0.01" value={rowData.fuel_price_max} onChange={(e) => setRowData({...rowData, fuel_price_max: e.target.value})} required />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Miles Min</Label>
                <Input type="number" value={rowData.miles_min} onChange={(e) => setRowData({...rowData, miles_min: e.target.value})} required />
              </div>
              <div>
                <Label>Miles Max</Label>
                <Input type="number" value={rowData.miles_max} onChange={(e) => setRowData({...rowData, miles_max: e.target.value})} required />
              </div>
            </div>
          )}

          <div>
            <Label>
              {selectedTable.charge_type === 'CPM_CENTS' ? 'Cents Per Mile' :
               selectedTable.charge_type === 'PERCENT_BPS' ? 'Percent (basis points)' :
               'Flat Charge (cents)'}
            </Label>
            <Input 
              type="number" 
              value={
                selectedTable.charge_type === 'CPM_CENTS' ? rowData.cpm_cents :
                selectedTable.charge_type === 'PERCENT_BPS' ? rowData.percent_bps :
                rowData.flat_cents
              }
              onChange={(e) => {
                const field = selectedTable.charge_type === 'CPM_CENTS' ? 'cpm_cents' :
                             selectedTable.charge_type === 'PERCENT_BPS' ? 'percent_bps' :
                             'flat_cents';
                setRowData({...rowData, [field]: e.target.value});
              }}
              required 
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddRow(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createRowMutation.mutate(rowData)} className="bg-emerald-600">
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FSC Table Builder</h1>
            <p className="text-slate-600 mt-1">Manage fuel surcharge tables for customer lanes</p>
          </div>
          <Button onClick={() => setShowCreateTable(true)} className="bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> Create FSC Table
          </Button>
        </div>

        {showCreateTable && <CreateTableForm />}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Table List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">FSC Tables ({tables.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tables.map(table => (
                <Button
                  key={table.id}
                  variant={selectedTable?.id === table.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTable(table)}
                >
                  <Fuel className="w-4 h-4 mr-2" />
                  {table.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Table Details */}
          <div className="lg:col-span-2">
            {selectedTable ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedTable.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge>{selectedTable.mode_scope}</Badge>
                        <Badge variant="outline">{selectedTable.basis_type}</Badge>
                        <Badge variant="outline">{selectedTable.charge_type}</Badge>
                      </div>
                    </div>
                    {!showAddRow && (
                      <Button onClick={() => setShowAddRow(true)} size="sm" className="bg-emerald-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Row
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {showAddRow && <AddRowForm />}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectedTable.basis_type === 'FUEL_PRICE' ? (
                          <>
                            <TableHead>Fuel Price Min</TableHead>
                            <TableHead>Fuel Price Max</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Miles Min</TableHead>
                            <TableHead>Miles Max</TableHead>
                          </>
                        )}
                        <TableHead>Charge</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.filter(r => r.is_active).map(row => (
                        <TableRow key={row.id}>
                          {selectedTable.basis_type === 'FUEL_PRICE' ? (
                            <>
                              <TableCell>${row.fuel_price_min}</TableCell>
                              <TableCell>${row.fuel_price_max}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{row.miles_min} mi</TableCell>
                              <TableCell>{row.miles_max} mi</TableCell>
                            </>
                          )}
                          <TableCell>
                            {row.cpm_cents ? `${row.cpm_cents}¢/mi` :
                             row.percent_bps ? `${(row.percent_bps / 100).toFixed(2)}%` :
                             row.flat_cents ? `$${(row.flat_cents / 100).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete this row?')) {
                                  base44.entities.CustomerFSCTableRow.update(row.id, { is_active: false })
                                    .then(() => queryClient.invalidateQueries({ queryKey: ['fscRows'] }));
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {rows.filter(r => r.is_active).length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      <p>No rows defined. Add rows to activate this table.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Fuel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Select a table to manage rows</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}