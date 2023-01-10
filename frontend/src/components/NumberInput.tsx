import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

type Props = {
  label: string;
  defaultValue: number;
  onChange: (value: number) => void;
};

function NumberInput({ label, defaultValue, onChange }: Props) {
  const [error, setError] = React.useState<boolean>(false);

  return (
    <TextField
      label={label}
      sx={{ flexGrow: 1, flexBasis: 1 }}
      defaultValue={defaultValue}
      error={error}
      size="small"
      variant="standard"
      onBlur={(event) => {
        const value = Number(event.target.value);

        if (!isNaN(value)) {
          onChange(value);
        }

        setError(isNaN(value));
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          (event.target as any).blur();
        } else if (event.key === "Escape") {
          (event.target as any).blur();
        }
      }}
      InputProps={{
        startAdornment: (
          <>
            <InputAdornment position="start">{">"}</InputAdornment>
          </>
        ),
      }}
    />
  );
}

export default NumberInput;
