import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Fuel, Wrench, CreditCard } from "lucide-react";

export default function ExpenseTracker() {
  const [showForm, setShowForm] = useState(false);
  const [expense, setExpense] = useState({
    category: 'fuel',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  const addExpenseMutation = useMutation({
    mutationFn: (data) => {
      // In production, this would save to a proper Expense entity
      alert(`Expense recorded: $${data.amount} for ${data.category}`);
      return Promise.resolve();
    },
    onSuccess: () => {
      setShowForm(false);
      setExpense({ category: 'fuel', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    }
  });

  const categories = [
    { value: 'fuel', label: 'Fuel', icon: Fuel, color: 'bg-red-100 text-red-800' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { value: 'insurance', label: 'Insurance', icon: CreditCard, color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: 'Other', icon: DollarSign, color: 'bg-slate-100 text-slate-800' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            Expense Tracker
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {showForm && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <select
              className="w-full p-2 border rounded"
              value={expense.category}
              onChange={(e) => setExpense({...expense, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
            />
            <Input
              placeholder="Description"
              value={expense.description}
              onChange={(e) => setExpense({...expense, description: e.target.value})}
            />
            <Input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={() => addExpenseMutation.mutate(expense)} className="flex-1 bg-emerald-600">
                Save Expense
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.value} className="p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <Badge className={cat.color}>{cat.label}</Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}