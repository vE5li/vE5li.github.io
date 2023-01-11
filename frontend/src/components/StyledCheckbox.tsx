import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

type Props = {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
};

// Material UI Checkbox that can be toggled by pressing enter.
function StyledCheckbox({ label, value, setValue }: Props) {
  return (
    <FormControlLabel
      sx={{ color: "text.secondary" }}
      control={
        <Checkbox
          checked={value}
          size="small"
          onKeyDown={(event) => {
            switch (event.key) {
              case "Escape":
                (event.target as any).blur();
                break;
              case "Enter":
                setValue(!value);
                break;
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
