import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete from "@mui/material/Autocomplete";
import Paper from "@mui/material/Paper";

type Props = {
  label: string;
  options: string[];
  selectCallback: (value: string) => void;
};

// Material UI Autocomplete that clears itself when selecting a valid entry.
function Selector({ label, options, selectCallback }: Props) {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Autocomplete
      autoHighlight
      options={options}
      value={null}
      inputValue={inputValue}
      sx={{ paddingTop: "1rem" }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          (event.target as any).blur();
        }
      }}
      onChange={(_, value) => {
        if (value !== null) {
          selectCallback(value);
        }
        setInputValue("");
      }}
      onInputChange={(_, value) => {
        setInputValue(value);
      }}
      PaperComponent={(props) => {
        return (
          <Paper elevation={1} square={true} variant="elevation" {...props} />
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          variant="standard"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">{">"}</InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default Selector;
