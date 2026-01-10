import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PendingQuotesAlert({ count }) {
  if (count === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                {count} Pending Quote{count !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700">
                Requires your attention
              </p>
            </div>
          </div>
          <Link to={createPageUrl("QuoteManagement")}>
            <Button variant="outline" className="border-amber-300 hover:bg-amber-100">
              Review Quotes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}