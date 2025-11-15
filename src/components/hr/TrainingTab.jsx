import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, GraduationCap, Calendar, Award, User } from "lucide-react";

export default function TrainingTab() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: trainingRecords = [], isLoading } = useQuery({
    queryKey: ['trainingRecords'],
    queryFn: () => base44.entities.TrainingRecord.list('-training_date', 100),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
    initialData: [],
  });

  const filteredRecords = trainingRecords.filter(r => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const employee = employees.find(e => e.id === r.employee_id);
    return (
      r.training_name?.toLowerCase().includes(searchLower) ||
      r.training_type?.toLowerCase().includes(searchLower) ||
      employee?.first_name?.toLowerCase().includes(searchLower) ||
      employee?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Training & Development</h2>
              <p className="text-slate-600 mt-1">Track employee training and certifications</p>
            </div>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Training Record
            </Button>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search training records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No training records</h3>
            <p className="text-slate-600">Start tracking employee training and certifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{record.training_name}</h3>
                        <Badge className="mt-1">{record.training_type}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{getEmployeeName(record.employee_id)}</span>
                      </div>

                      {record.training_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(record.training_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {record.expiration_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-red-400" />
                          <span>Expires: {new Date(record.expiration_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {record.instructor && (
                      <p className="text-sm text-slate-600 mt-2">
                        <strong>Instructor:</strong> {record.instructor}
                      </p>
                    )}
                  </div>

                  {record.completed && (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <Award className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}