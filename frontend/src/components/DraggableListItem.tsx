import React, { FC } from "react";
import { Draggable } from "react-beautiful-dnd";
import ListItemIcon from "@mui/material/ListItemIcon";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ImageIcon from "@mui/icons-material/Image";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tooltip,
} from "@mui/material";

export type Item = {
  id: string;
  name: string;
};

export type Props = {
  item: Item;
  index: number;
  moveCallback: (id: string, direction: number) => void;
  deleteCallback: (id: string) => void;
};

const DraggableListItem: FC<Props> = ({
  item,
  index,
  moveCallback,
  deleteCallback,
}) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            height: "2rem",
            padding: 0,
            "&:focus": { color: "#f59464", outline: "none" },
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              (event.target as any).blur();
            } else if (event.key === "ArrowUp") {
              moveCallback(item.id, -1);
              event.preventDefault();
            } else if (event.key === "ArrowDown") {
              moveCallback(item.id, 1);
              event.preventDefault();
            }
          }}
          onClick={() => deleteCallback(item.id)}
        >
          <ImageIcon sx={{ paddingRight: "1rem", width: "2rem" }} />
          <ListItemText primary={item.name} />
          <ListItemIcon sx={{ minWidth: "0px", color: "#f5dd64" }}>
            <DragHandleIcon />
          </ListItemIcon>
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
