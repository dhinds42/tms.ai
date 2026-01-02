import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

/**
 * StandardTabs - Consistent tab component
 * 
 * Rules:
 * - No emojis
 * - Uniform height & padding
 * - Text only (badges for counts)
 * - Same placement under PageHeader
 */
export default function StandardTabs({ tabs, value, onValueChange, children }) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="space-y-4">
      <TabsList className="bg-white border border-slate-200 h-auto p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2 text-sm data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900"
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
            {tab.label}
            {tab.count !== undefined && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export { TabsContent };