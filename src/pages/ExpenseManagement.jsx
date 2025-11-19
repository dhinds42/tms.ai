import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, TrendingUp, CreditCard } from "lucide-react";

export default function ExpenseManagement() {
  const expenses = [
    { id: 1, driver: 'John Smith', type: 'Fuel', amount: 345.67, date: '2025-01-15', status: 'approved' },
    { id: 2, driver: 'Sarah Johnson', type: 'Meals', amount: 45.20, date: '2025-01-14', status: 'pending' },
    { id: 3, driver: 'Mike Wilson', type: 'Lodging', amount: 89.99, date: '2025-01-13', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-slate-600 mt-2">Track driver expenses and automate reimbursements</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Expenses</p>
                  <p className="text-3xl font-bold text-slate-900">$12,543</p>
                </div>
                <DollarSign className="w-12 h-12 text-slate-900 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {expenses.filter(e => e.status === 'pending').length}
                  </p>
                </div>
                <Receipt className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="text-3xl font-bold text-emerald-600">+15%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg per Driver</p>
                  <p className="text-3xl font-bold text-indigo-600">$347</p>
                </div>
                <CreditCard className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <Button className="bg-emerald-600">Submit Expense</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{expense.driver}</p>
                    <p className="text-sm text-slate-600">{expense.type} • {expense.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg">${expense.amount}</p>
                    <Badge className={expense.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-600'}>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}