import React, { FC } from "react";
import DraggableListItem from "./DraggableListItem";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { List } from "@mui/material";
import { Item } from "./DraggableListItem";
import Divider from "@mui/material/Divider";

export type Props = {
  items: Item[];
  onDragEnd: OnDragEndResponder;
  deleteCallback: (id: string) => void;
};

const DraggableList: FC<Props> = React.memo(
  ({ items, onDragEnd, deleteCallback }) => {
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
