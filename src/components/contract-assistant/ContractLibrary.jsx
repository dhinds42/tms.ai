import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Sparkles, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ContractLibrary({ contracts, onGenerate, onAnalyze }) {
  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    expired: "bg-red-100 text-red-700",
    terminated: "bg-slate-100 text-slate-700"
  };

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contracts Yet</h3>
        <p className="text-slate-600 mb-6">Generate your first AI-powered contract</p>
        <Button
          onClick={() => onGenerate(null)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Contract
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Contract Type</TableHead>
            <TableHead className="font-semibold">Party</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Start Date</TableHead>
            <TableHead className="font-semibold">End Date</TableHead>
            <TableHead className="font-semibold">Value</TableHead>
            <TableHead className="font-semibold">Auto-Renew</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const daysUntilExpiry = Math.floor((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;

            return (
              <TableRow key={contract.id}>
                <TableCell>
                  <span className="font-medium text-slate-900 capitalize">
                    {contract.type.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-700">{contract.party}</span>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[contract.status]}>
                    {contract.status}
                  </Badge>
                  {isExpiringSoon && (
                    <Badge className="ml-2 bg-amber-100 text-amber-700">
                      Expires in {daysUntilExpiry}d
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(contract.start_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(contract.end_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-emerald-600">
                    ${contract.value.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={contract.auto_renew ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                    {contract.auto_renew ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAnalyze(contract)}
                      variant="outline"
                      className="border-emerald-300 text-emerald-700"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}