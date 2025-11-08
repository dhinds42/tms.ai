import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, TrendingUp, Calculator, CheckCircle } from "lucide-react";

import QuoteForm from "../components/quotes/QuoteForm";
import QuotesList from "../components/quotes/QuotesList";
import RateBenchmark from "../components/quotes/RateBenchmark";
import MarginCalculator from "../components/quotes/MarginCalculator";

export default function QuoteManagement() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
    initialData: [],
  });

  const createQuoteMutation = useMutation({
    mutationFn: (quoteData) => base44.entities.Quote.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setShowQuoteForm(false);
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setSelectedQuote(null);
    },
  });

  const handleSaveQuote = (quoteData) => {
    if (selectedQuote) {
      updateQuoteMutation.mutate({ id: selectedQuote.id, data: quoteData });
    } else {
      createQuoteMutation.mutate(quoteData);
    }
  };

  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const totalValue = quotes.reduce((sum, q) => sum + (q.quoted_rate || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Quote & Rate Management
            </h1>
            <p className="text-slate-600 mt-2">
              Multi-mode quoting (FTL, LTL, Intermodal, Courier, Drayage)
            </p>
          </div>
          <Button
            onClick={() => setShowQuoteForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quote
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Quotes</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{quotes.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingQuotes}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{acceptedQuotes}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Value</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${(totalValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RateBenchmark />
          <MarginCalculator />
        </div>

        {/* Quotes List */}
        <QuotesList 
          quotes={quotes}
          isLoading={isLoading}
          onEdit={(quote) => {
            setSelectedQuote(quote);
            setShowQuoteForm(true);
          }}
          onConvertToLoad={(quote) => {
            // Will implement conversion
            alert('Converting quote to load...');
          }}
        />

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <QuoteForm
            quote={selectedQuote}
            onSave={handleSaveQuote}
            onClose={() => {
              setShowQuoteForm(false);
              setSelectedQuote(null);
            }}
            isLoading={createQuoteMutation.isPending || updateQuoteMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}