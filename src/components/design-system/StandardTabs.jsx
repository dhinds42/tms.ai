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
export default function StandardTabs({ tabs, activeTab, onTabChange, value, onValueChange, children }) {
  // Support both activeTab/onTabChange and value/onValueChange patterns
  const tabValue = value || activeTab;
  const handleChange = onValueChange || onTabChange;
  
  return (
    <Tabs value={tabValue} onValueChange={handleChange} className="space-y-4">
      <TabsList 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-default)' 
        }} 
        className="border h-auto p-1"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key || tab.value}
            value={tab.key || tab.value}
            style={{
              color: tabValue === (tab.key || tab.value) ? 'var(--primary-default)' : 'var(--text-secondary)'
            }}
            className="px-4 py-2 text-sm data-[state=active]:bg-[var(--primary-bg)]"
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