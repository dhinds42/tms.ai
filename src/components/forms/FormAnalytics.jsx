import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function FormAnalytics({ submissions, templates }) {
  const submissionsByType = {};
  submissions.forEach(sub => {
    const template = templates.find(t => t.id === sub.form_template_id);
    const type = template?.form_type || 'unknown';
    submissionsByType[type] = (submissionsByType[type] || 0) + 1;
  });

  const chartData = Object.entries(submissionsByType).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count
  }));

  const statusData = ['submitted', 'approved', 'rejected', 'draft'].map(status => ({
    name: status,
    value: submissions.filter(s => s.status === status).length
  }));

  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#94a3b8'];

  const syncStats = {
    crm: submissions.filter(s => s.synced_to_crm).length,
    tms: submissions.filter(s => s.synced_to_tms).length,
    pending: submissions.filter(s => !s.synced_to_crm && !s.synced_to_tms).length
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Total Submissions</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{submissions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Synced to CRM</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{syncStats.crm}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Synced to TMS</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{syncStats.tms}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Submissions by Form Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}