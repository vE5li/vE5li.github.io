import React, { FC } from "react";
import DraggableListItem from "./DraggableListItem";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { List } from "@mui/material";
import { Item } from "./DraggableListItem";

export type Props = {
  items: Item[];
  onDragEnd: OnDragEndResponder;
  moveCallback: (id: string, direction: number) => void;
  deleteCallback: (id: string) => void;
};

// List of draggable items, useful for letting the user reorder the elements.
const DraggableList: FC<Props> = React.memo(
  ({ items, onDragEnd, moveCallback, deleteCallback }) => {
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
                    moveCallback={moveCallback}
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
  }
);

export default DraggableList;
