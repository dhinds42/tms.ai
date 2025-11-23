import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, GripVertical } from "lucide-react";

export default function DragDropKanban({ loads = [], onLoadStatusChange }) {
  const [localLoads, setLocalLoads] = useState(loads);

  // Update local state when props change
  React.useEffect(() => {
    setLocalLoads(loads);
  }, [loads]);

  const statusColumns = [
    { id: 'available', label: 'Available', color: 'bg-slate-50' },
    { id: 'tendered', label: 'Tendered', color: 'bg-blue-50' },
    { id: 'assigned', label: 'Assigned', color: 'bg-purple-50' },
    { id: 'dispatched', label: 'Dispatched', color: 'bg-indigo-50' },
    { id: 'in_transit', label: 'In Transit', color: 'bg-cyan-50' },
    { id: 'delivered', label: 'Delivered', color: 'bg-emerald-50' }
  ];

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const load = localLoads.find(l => l.id === draggableId);
    if (!load) return;

    const newStatus = destination.droppableId;
    
    // Update local state immediately
    const updatedLoads = localLoads.map(l => 
      l.id === draggableId ? { ...l, status: newStatus } : l
    );
    setLocalLoads(updatedLoads);

    // Notify parent
    if (onLoadStatusChange) {
      onLoadStatusChange(load, newStatus);
    }
  };

  const getLoadsByStatus = (status) => {
    return localLoads.filter(load => load.status === status);
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Drag & Drop Load Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-6 gap-4">
            {statusColumns.map((column) => (
              <div key={column.id} className={`${column.color} rounded-xl p-4 min-h-[500px]`}>
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{column.label}</h3>
                  <Badge variant="outline" className="bg-white">
                    {getLoadsByStatus(column.id).length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                      }`}
                    >
                      {getLoadsByStatus(column.id).map((load, index) => (
                        <Draggable key={load.id} draggableId={load.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg border-2 border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-slate-400" />
                                  <span className="font-semibold text-sm text-slate-900">
                                    {load.load_number || `#${load.id.slice(0, 8)}`}
                                  </span>
                                </div>
                                <Badge className="text-xs bg-emerald-600 text-white">
                                  ${load.customer_rate?.toLocaleString() || '0'}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>{load.pickup_location?.city || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-blue-600" />
                                  <span>{load.dropoff_location?.city || 'N/A'}</span>
                                </div>
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