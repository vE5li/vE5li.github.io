import { useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import NumberInput from "./components/NumberInput";
import ColorInput from "./components/ColorInput";
import StyledLink from "./components/StyledLink";
import StyledCheckbox from "./components/StyledCheckbox";
import DraggableList from "./components/DraggableList";
import Selector from "./components/Selector";
import { Item, newItem } from "./components/DraggableListItem";
import { ImageParameters, WorkerMessage } from "./worker/generate";
import theme from "./theme";
import "./App.css";

function App() {
  // List of all available Ferris SVG files in https://github.com/vE5li/ferrises.
  const [availableFerrises, setAvailableFerrises] = useState<string[]>([]);

  // URL to the final image generated using Rust.
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // Image parameters.
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [ferrisSize, setFerrisSize] = useState<number>(320);
  const [spacing, setSpacing] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#333333");
  const [separatorRadius, setSeparatorRadius] = useState<number>(20);
  const [separatorColor, setSeparatorColor] = useState<string>("#444444");
  const [ferrises, setFerrises] = useState<Item[]>([
    newItem("alien"),
    newItem("tophat"),
  ]);
  const [useSeparators, setUseSeparators] = useState<boolean>(false);
  const [useCrosses, setUseCrosses] = useState<boolean>(false);

  // Since the image generation is very computationally expensive, we utilize a worker thread to
  // do the heavy lifting. If we were to call the 'generate' function in the main thread, the UI would
  // hang for up to multiple seconds every time the parameters are adjusted.
  const worker: Worker = useMemo(
    () => new Worker(new URL("./worker/generate.ts", import.meta.url)),
    []
  );

  // Create image parameters from the state and send a message to the worker thread with
  // our input parameters.
  const generateImage = async () => {
    // TypeScript cannot infer the type of our message, so we annotate it manually
    // to make sure all image parameters are set correctly.
    const parameters: ImageParameters = {
      width,
      height,
      ferrisSize,
      spacing,
      backgroundColor,
      separatorRadius,
      separatorColor,
      ferrises: ferrises.map((item) => item.name),
      useSeparators,
      useCrosses,
    };

    worker.postMessage(parameters);
  };

  // Get a list of all available Ferrises. This code will only run once.
  useEffect(() => {
    fetch("https://api.github.com/repos/vE5li/ferrises/git/trees/master")
      .then((response) => response.json())
      .then((data) => data.tree.map((item: any) => item.path.slice(0, -4)))
      .then((ferrises) => setAvailableFerrises(ferrises));
  }, []);

  // This will re-generate the image any time one of the variables below change.
  useEffect(() => {
    generateImage().catch(console.error);
  }, [
    width,
    height,
    ferrisSize,
    spacing,
    backgroundColor,
    separatorRadius,
    separatorColor,
    ferrises,
    useSeparators,
    useCrosses,
  ]);

  // This callback handles messages from the worker thread.
  useEffect(() => {
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { data } = event;

      // The worker has generated a new image, so we set the image URL to our new image.
      // By doing so we update the preview at the bottom of the page and also change the
      // file that will be downloaded when clicking the download link.
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);

        // A message without data means that the worker is done initializing. This will only
        // happen once, specifically when the website first loads. It is designed that way
        // because otherwise the user won't see an image until they change a parameter. On
        // receiving this empty message we instantly request a new image, our de facto default
        // image.
      } else {
        generateImage();
      }
    };
  }, [worker]);

  // Entire website body.
  return (
    <ThemeProvider theme={theme}>
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
          <Selector
            label="add a ferris"
            options={availableFerrises}
            selectCallback={(name) => setFerrises([...ferrises, newItem(name)])}
          />
          {ferrises.length > 0 && (
            <DraggableList items={ferrises} setItems={setFerrises} />
          )}
        </Box>
        {/* Separators */}
        <Grid
          container
          spacing={2}
          columns={6}
          sx={{ "& .MuiGrid-item": { paddingTop: "0" } }}
        >
          <Grid item sm={6} md={2}>
            <StyledCheckbox
              label="separators"
              value={useSeparators}
              setValue={setUseSeparators}
            />
          </Grid>
          <Grid item sm={6} md={2}>
            {useSeparators && (
              <StyledCheckbox
                label="use crosses as separators"
                value={useCrosses}
                setValue={setUseCrosses}
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
