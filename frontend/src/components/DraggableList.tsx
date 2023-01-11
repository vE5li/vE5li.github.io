import React, { FC } from "react";
import { List } from "@mui/material";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import DraggableListItem from "./DraggableListItem";
import { Item } from "./DraggableListItem";

export type Props = {
  items: Item[];
  setItems: (items: Item[]) => void;
};

// List of draggable items, useful for letting the user reorder the elements.
const DraggableList: FC<Props> = React.memo(({ items, setItems }) => {
  // Helper function to move an item from one position to another.
  const reorder = (
    items: Item[],
    startIndex: number,
    endIndex: number
  ): Item[] => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  // Callback for moving an item up or down the list by dragging and dropping.
  const onDragEnd = ({ destination, source }: DropResult) => {
    // Item was dropped outside the list.
    if (!destination) return;
    setItems(reorder(items, source.index, destination.index));
  };

  // Callback for moving an item up or down the list with the arrow keys.
  const moveItem = (id: string, direction: number) => {
    const source_index = items.findIndex((item) => item.id == id);
    const destination_index = source_index + direction;

    // Item would be moved outside the list.
    if (destination_index === -1 || destination_index === items.length) return;
    setItems(reorder(items, source_index, destination_index));
  };

  // Callback for when an item is supposed to be deleted.
  const deleteCallback = (id: string) => {
    setItems(items.filter((element) => element.id !== id));
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {(provided) => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((item, index) => (
                <DraggableListItem
                  item={item}
                  index={index}
                  key={item.id}
                  moveCallback={moveItem}
                  deleteCallback={deleteCallback}
                />
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
});

export default DraggableList;
