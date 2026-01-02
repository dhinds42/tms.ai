import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Generic draggable list component
 * Used for reordering items (e.g., line items, documents)
 */
export default function DraggableList({ 
  items, 
  onReorder, 
  renderItem, 
  droppableId = 'list',
  disabled = false,
  className = ''
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    onReorder(sourceIndex, destIndex, result.draggableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} isDropDisabled={disabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${className} ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {items.map((item, index) => (
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
                    className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                  >
                    {renderItem(item, index, snapshot.isDragging)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}