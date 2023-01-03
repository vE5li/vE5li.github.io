import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { SxProps } from "@mui/material";

type Props = {
  label: string;
  defaultValue: number;
  onChange: (value: number) => void;
  sx?: SxProps;
};

function NumberInput({ label, defaultValue, onChange, sx }: Props) {
  const [error, setError] = React.useState<boolean>(false);

  return (
    <TextField
      label={label}
      sx={sx}
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
