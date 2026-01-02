import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Kanban-style board for workflow management (e.g., dispatch board)
 * P0-A: Used for Load stage transitions
 */
export default function KanbanBoard({ 
  columns, 
  items, 
  onCardMove, 
  renderCard,
  disabled = false 
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceColumn = result.source.droppableId;
    const destColumn = result.destination.droppableId;
    const itemId = result.draggableId;
    
    if (sourceColumn === destColumn) return;

    onCardMove({
      itemId,
      fromColumn: sourceColumn,
      toColumn: destColumn,
      fromIndex: result.source.index,
      toIndex: result.destination.index
    });
  };

  const getColumnItems = (columnId) => {
    return items.filter(item => item.columnId === columnId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="outline" className="ml-2">
                    {getColumnItems(column.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId={column.id} isDropDisabled={disabled}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-2 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-bg border-2 border-primary-border' : 'bg-bg-hover'
                      }`}
                    >
                      {getColumnItems(column.id).map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          isDragDisabled={disabled}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'opacity-50 rotate-2 scale-105' : ''
                              } transition-transform`}
                            >
                              {renderCard(item, snapshot.isDragging)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}