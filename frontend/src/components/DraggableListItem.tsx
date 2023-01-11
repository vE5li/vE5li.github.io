import { FC } from "react";
import { Draggable } from "react-beautiful-dnd";
import ListItemIcon from "@mui/material/ListItemIcon";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ImageIcon from "@mui/icons-material/Image";
import { ListItem, ListItemText } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export type Item = {
  id: string;
  name: string;
};

export function newItem(name: string): Item {
  return { id: uuidv4(), name };
}

export type Props = {
  item: Item;
  index: number;
  moveCallback: (id: string, direction: number) => void;
  deleteCallback: (id: string) => void;
};

// Item for the DraggableList. Items can be reordered both by dragging them with the mouse
// but also using the arrow keys. Clicking on an item will remove it from the list.
const DraggableListItem: FC<Props> = ({
  item,
  index,
  moveCallback,
  deleteCallback,
}) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, _) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            height: "2rem",
            padding: 0,
            "&:focus": { color: "primary.main", outline: "none" },
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case "Escape":
                (event.target as any).blur();
                break;
              case "ArrowUp":
                moveCallback(item.id, -1);
                event.preventDefault();
                break;
              case "ArrowDown":
                moveCallback(item.id, 1);
                event.preventDefault();
                break;
            }
          }}
          onClick={() => deleteCallback(item.id)}
        >
          <ImageIcon sx={{ paddingRight: "1rem", width: "2rem" }} />
          <ListItemText primary={item.name} />
          <ListItemIcon sx={{ minWidth: "0px", color: "text.primary" }}>
            <DragHandleIcon />
          </ListItemIcon>
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
