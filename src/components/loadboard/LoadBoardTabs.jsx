import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function LoadBoardTabs({ activeTab, onTabChange, tabCounts }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-3">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-slate-100 grid grid-cols-4 md:grid-cols-8 gap-0.5 h-auto p-1">
            <TabsTrigger value="active" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Active <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.active}</Badge>
            </TabsTrigger>
            <TabsTrigger value="planning" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Plan <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.planning}</Badge>
            </TabsTrigger>
            <TabsTrigger value="accounting" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Acct <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.accounting}</Badge>
            </TabsTrigger>
            <TabsTrigger value="misc" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Misc <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.misc}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ltl" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              LTL <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.ltl}</Badge>
            </TabsTrigger>
            <TabsTrigger value="my" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Mine <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.my}</Badge>
            </TabsTrigger>
            <TabsTrigger value="external" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              Ext <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.external}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
              All <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.all}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}