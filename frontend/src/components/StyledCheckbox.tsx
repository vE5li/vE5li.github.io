import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

type Props = {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
};

function StyledCheckbox({ label, value, setValue }: Props) {
  return (
    <FormControlLabel
      sx={{ color: "text.secondary" }}
      control={
        <Checkbox
          checked={value}
          size="small"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setValue(!value);
            } else if (event.key === "Escape") {
              (event.target as any).blur();
            }
          }}
          onChange={(event) => setValue(event.target.checked)}
        />
      }
      label={label}
    />
  );
}

export default StyledCheckbox;
