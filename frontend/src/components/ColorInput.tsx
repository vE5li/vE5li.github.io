import TextField from "@mui/material/TextField";

type Props = {
  label: string;
  defaultValue: string;
  onChange: (value: string) => void;
};

// Input field that uses the color picker provided by the browser.
function ColorInput({ label, defaultValue, onChange }: Props) {
  return (
    <TextField
      label={label}
      type="color"
      sx={{ flexGrow: 1, flexBasis: 1, width: "100%" }}
      variant="standard"
      size="small"
      value={defaultValue}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          (event.target as any).blur();
        }
      }}
      onChange={(color) => onChange(color.target.value)}
    />
  );
}

export default ColorInput;
