import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import NumberInput from "./components/NumberInput";
import ColorInput from "./components/ColorInput";
import StyledLink from "./components/StyledLink";
import StyledCheckbox from "./components/StyledCheckbox";
import { DropResult } from "react-beautiful-dnd";
import DraggableList from "./components/DraggableList";
import { Item } from "./components/DraggableListItem";
import { reorder } from "./util";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { v4 as uuidv4 } from "uuid";
import { TsSettings, WorkerMessage } from "./worker/generate";

const darkTheme = createTheme({
  typography: {
    fontFamily: "monospace",
  },
  palette: {
    background: {
      default: "#582e6b",
      paper: "#3f204d",
    },
    primary: {
      main: "#f59464",
    },
    text: {
      primary: "#f5dd64",
      secondary: "#f09cff",
      disabled: "#9b6fb0",
    },
    common: {
      black: "#f5dd64",
    },
  },
});

function App() {
  // State
  const [mapping, setMapping] = useState<string[]>([]);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [backgroundColor, setBackgroundColor] = useState<string>("#333333");
  const [ferrisSize, setFerrisSize] = useState<number>(320);
  const [spacing, setSpacing] = useState<number>(0);
  const [separators, setSeparators] = useState<boolean>(false);
  const [separatorRadius, setSeparatorRadius] = useState<number>(20);
  const [separatorColor, setSeparatorColor] = useState<string>("#444444");
  const [crosses, setCrosses] = useState<boolean>(false);
  const [ferrises, setFerrises] = useState<Item[]>([
    { id: uuidv4(), name: "alien" },
    { id: uuidv4(), name: "tophat" },
  ]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  const worker: Worker = useMemo(
    () => new Worker(new URL("./worker/generate.ts", import.meta.url)),
    []
  );

  const generateImage = async () => {
    const settings: TsSettings = {
      width,
      height,
      backgroundColor,
      ferrises: ferrises.map((item) => item.name),
      ferrisSize,
      ferrisOffset: spacing,
      showCircles: separators,
      circleRadius: separatorRadius,
      circleColor: separatorColor,
      useCrosses: crosses,
    };

    worker.postMessage(settings);
  };

  // Get a list of all available ferrises.
  useEffect(() => {
    fetch("https://api.github.com/repos/vE5li/ferrises/git/trees/master")
      .then((response) => response.json())
      .then((data) => data.tree.map((item: any) => item.path.slice(0, -4)))
      .then((ferrises) => setMapping(ferrises));
  }, []);

  useEffect(() => {
    worker.onmessage = (event: MessageEvent) => {
      const { data } = event;
      const message: WorkerMessage = data;

      if (message.state === "ready") {
        generateImage();
      } else {
        setImageUrl(message.data);
      }
    };
  }, [worker]);

  React.useEffect(() => {
    generateImage().catch(console.error);
  }, [
    width,
    height,
    backgroundColor,
    ferrisSize,
    spacing,
    separators,
    separatorRadius,
    separatorColor,
    crosses,
    ferrises,
  ]);

  const onDragEnd = ({ destination, source }: DropResult) => {
    // dropped outside the list
    if (!destination) return;
    setFerrises(reorder(ferrises, source.index, destination.index));
  };

  const moveItem = (id: string, direction: number) => {
    const source_index = ferrises.findIndex((item) => item.id == id);
    const destination_index = source_index + direction;

    if (destination_index === -1 || destination_index === ferrises.length)
      return;

    setFerrises(reorder(ferrises, source_index, destination_index));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Typography
        variant="h2"
        align="center"
        sx={{ padding: "2rem", color: "#f56464" }}
      >
        O₃xidize your screen
      </Typography>
      <Box
        className="App"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          margin: "1rem",
        }}
      >
        {/* Generic image settings */}
        <Grid container spacing={2} columns={14}>
          <Grid item xs={12} sm={7} md={2}>
            <NumberInput
              label="width"
              defaultValue={width}
              onChange={setWidth}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <NumberInput
              label="height"
              defaultValue={height}
              onChange={setHeight}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <NumberInput
              label="ferris size"
              defaultValue={ferrisSize}
              onChange={setFerrisSize}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <NumberInput
              label="spacing"
              defaultValue={spacing}
              onChange={setSpacing}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <ColorInput
              label="background color"
              defaultValue={backgroundColor}
              onChange={setBackgroundColor}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <NumberInput
              label="separator radius"
              defaultValue={separatorRadius}
              onChange={setSeparatorRadius}
            />
          </Grid>
          <Grid item xs={14} sm={7} md={2}>
            <ColorInput
              label="separator color"
              defaultValue={separatorColor}
              onChange={setSeparatorColor}
            />
          </Grid>
        </Grid>
        {/* Selecting Ferrises */}
        <Box>
          <Autocomplete
            options={mapping}
            value={null}
            inputValue={autocompleteInputValue}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                (event.target as any).blur();
              }
            }}
            onChange={(_, value) => {
              if (value !== null) {
                setFerrises([...ferrises, { id: uuidv4(), name: value }]);
              }
              setAutocompleteInputValue("");
            }}
            onInputChange={(_, value) => {
              setAutocompleteInputValue(value);
            }}
            autoHighlight
            PaperComponent={(props) => {
              return (
                <Paper
                  elevation={1}
                  square={true}
                  variant="elevation"
                  {...props}
                />
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="add a ferris"
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
          {ferrises.length > 0 && (
            <DraggableList
              items={ferrises}
              onDragEnd={onDragEnd}
              moveCallback={moveItem}
              deleteCallback={(id) => {
                setFerrises(ferrises.filter((element) => element.id !== id));
              }}
            />
          )}
        </Box>
        {/* Spacers */}
        <Grid
          container
          spacing={2}
          columns={6}
          sx={{ "& .MuiGrid-item": { paddingTop: "0" } }}
        >
          <Grid item sm={6} md={2}>
            <StyledCheckbox
              label="separators"
              value={separators}
              setValue={setSeparators}
            />
          </Grid>
          <Grid item sm={6} md={2}>
            {separators && (
              <StyledCheckbox
                label="use crosses as separators"
                value={crosses}
                setValue={setCrosses}
              />
            )}
          </Grid>
        </Grid>
        {/* Image preview and download */}
        {imageUrl !== undefined && (
          <>
            <img src={imageUrl} width="100%" />
            <StyledLink
              text="> download image"
              download={"wallpaper.png"}
              href={imageUrl}
              fontSize="1.2rem"
              trigger={
                "https://api.countapi.xyz/hit/oxidize-your-screen/download"
              }
            />
          </>
        )}
      </Box>
      {/* Foot note */}
      <Typography
        sx={{
          padding: "1rem",
          paddingTop: "3rem",
          fontSize: "0.8rem",
          color: "text.disabled",
        }}
      >
        This website is made with TypeScript and React. You can check out the
        source code on{" "}
        <StyledLink
          text="GitHub"
          href="https://github.com/vE5li/vE5li.github.io"
          fontSize="0.8rem"
          tabIndex={-1}
        />
        .
      </Typography>
    </ThemeProvider>
  );
}

export default App;
