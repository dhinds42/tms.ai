import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, DollarSign } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function DragDropKanban({ loads, onLoadStatusChange }) {
  const columns = {
    available: { title: "Available", color: "bg-amber-100 border-amber-300" },
    assigned: { title: "Assigned", color: "bg-blue-100 border-blue-300" },
    in_transit: { title: "In Transit", color: "bg-purple-100 border-purple-300" },
    delivered: { title: "Delivered", color: "bg-emerald-100 border-emerald-300" }
  };

  const getLoadsByStatus = (status) => {
    return loads.filter(l => l.status === status);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const load = loads.find(l => l.id === draggableId);
    
    if (load && load.status !== newStatus) {
      onLoadStatusChange(load, newStatus);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          Load Assignment Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(columns).map(([status, config]) => (
              <div key={status} className="space-y-2">
                <div className={`p-3 rounded-lg ${config.color} border-2`}>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{config.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {getLoadsByStatus(status).length} loads
                  </Badge>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] p-2 rounded-lg border-2 border-dashed ${
                        snapshot.isDraggingOver ? 'bg-indigo-50 border-indigo-400' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {getLoadsByStatus(status).map((load, index) => (
                        <Draggable key={load.id} draggableId={load.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-900">
                                    {load.load_number || load.id.slice(0, 8)}
                                  </span>
                                  {load.customer_rate && (
                                    <span className="text-xs font-semibold text-emerald-600">
                                      ${load.customer_rate.toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {load.pickup_location?.city} → {load.dropoff_location?.city}
                                  </span>
                                </div>

                                {load.eta && (
                                  <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {new Date(load.eta).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}