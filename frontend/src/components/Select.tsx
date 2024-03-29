import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

type Props = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
};

// Material UI Select with label.
function Selector({ label, value, setValue, options }: Props) {
  return (
    <FormControl
      sx={{ flexGrow: 1, flexBasis: 1, width: "100%" }}
      variant="standard"
    >
      <InputLabel id="separator-selector">{label}</InputLabel>
      <Select
        labelId="separator-selector"
        value={value}
        label="separator"
        variant="standard"
        size="small"
        onChange={(event) => setValue(event.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default Selector;
