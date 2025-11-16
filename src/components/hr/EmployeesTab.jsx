import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Building, Calendar, Award } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";

export default function EmployeesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowAddModal(false);
    },
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
    initialData: [],
  });

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.first_name?.toLowerCase().includes(searchLower) ||
      emp.last_name?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.employee_id?.toLowerCase().includes(searchLower) ||
      emp.department?.toLowerCase().includes(searchLower)
    );
  });

  const getDepartmentColor = (dept) => {
    const colors = {
      operations: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      dispatch: 'bg-purple-100 text-purple-800',
      accounting: 'bg-amber-100 text-amber-800',
      safety: 'bg-red-100 text-red-800',
      it: 'bg-cyan-100 text-cyan-800',
      hr: 'bg-pink-100 text-pink-800',
      management: 'bg-indigo-100 text-indigo-800'
    };
    return colors[dept?.toLowerCase()] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Employee Directory</h2>
              <p className="text-slate-600 mt-1">Manage all company employees</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No employees found</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try adjusting your search' : 'Add your first employee to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {employee.first_name?.[0]}{employee.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-sm text-slate-600">{employee.job_title}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employee.department && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department}
                      </Badge>
                    </div>
                  )}

                  {employee.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}

                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{employee.phone}</span>
                    </div>
                  )}

                  {employee.hire_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      ID: {employee.employee_id}
                    </Badge>
                    <Badge className={employee.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}