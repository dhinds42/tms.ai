import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function DateRangeFilter({ dateRange, onChange }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-3 flex gap-3">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onChange({ ...dateRange, start: e.target.value })}
          className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onChange({ ...dateRange, end: e.target.value })}
          className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm"
        />
      </CardContent>
    </Card>
  );
}