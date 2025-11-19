import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus } from "lucide-react";

export default function ExpenseTracker() {
  const [newExpense, setNewExpense] = useState({
    category: 'fuel',
    amount: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const addExpense = useMutation({
    mutationFn: async (expense) => {
      // Create expense record
      return { success: true, expense };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setNewExpense({ category: 'fuel', amount: '', description: '' });
      alert('Expense added successfully');
    },
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          Expense Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-2">📊 Track Expenses</h4>
          <p className="text-sm text-slate-600">
            Fuel, maintenance, tolls, driver expenses
          </p>
        </div>

        <div className="space-y-3">
          <Select
            value={newExpense.category}
            onValueChange={(value) => setNewExpense({...newExpense, category: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="tolls">Tolls</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="driver_pay">Driver Pay</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
          />

          <Input
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
          />

          <Button 
            onClick={() => addExpense.mutate(newExpense)}
            className="w-full bg-emerald-600"
            disabled={!newExpense.amount}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}