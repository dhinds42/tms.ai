import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Truck } from "lucide-react";
import { EmptyState, SkeletonCard } from "@/components/design-system";
import CarrierCard from "./CarrierCard";

export default function CarrierGrid({ 
  carriers, 
  isLoading, 
  searchTerm,
  onEdit, 
  onVet,
  onCreate 
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  if (carriers.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        title="No carriers found"
        description={searchTerm ? "Try adjusting your search" : "Create your first carrier to start building your network"}
        action={{
          label: 'Create Carrier',
          icon: Plus,
          onClick: onCreate
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {carriers.map((carrier) => (
        <div key={carrier.id} className="relative">
          <CarrierCard carrier={carrier} onEdit={onEdit} />
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => onVet(carrier)}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Brain className="w-3 h-3 mr-1" />
              AI Vet
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}