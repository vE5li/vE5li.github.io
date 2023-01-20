import { useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider } from "@mui/material/styles";
import NumberInput from "./components/NumberInput";
import ColorInput from "./components/ColorInput";
import StyledLink from "./components/StyledLink";
import StyledCheckbox from "./components/StyledCheckbox";
import DraggableList from "./components/DraggableList";
import Selector from "./components/Selector";
import Select from "./components/Select";
import { Item, newItem } from "./components/DraggableListItem";
import { ImageParameters, WorkerMessage } from "./worker/generate";
import theme from "./theme";
import "./App.css";

// Since the image generation is very computationally expensive, we utilize a worker thread to
// do the heavy lifting. If we were to call the 'generate' function in the main thread, the UI would
// hang for up to multiple seconds every time the parameters are adjusted.
let worker: Worker = new Worker(
  new URL("./worker/generate.ts", import.meta.url)
);

// This will cache the SVG data that is fetched so we don't do duplicate work.
let ferrisCache: Record<string, string> = {};
let separatorCache: Record<string, string> = {};

function App() {
  // Lists of all available Ferris and separator SVG files.
  const [availableFerrises, setAvailableFerrises] = useState<string[]>([]);
  const [availableSeparators, setAvailableSeparators] = useState<string[]>([]);

  // URL to the final image generated using Rust.
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  // Image parameters.
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [ferrisSize, setFerrisSize] = useState<number>(320);
  const [spacing, setSpacing] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#333333");
  const [ferrises, setFerrises] = useState<Item[]>([
    newItem("alien"),
    newItem("tophat"),
  ]);
  const [useSeparators, setUseSeparators] = useState<boolean>(false);
  const [separatorType, setSeparatorType] = useState<string>("circle");
  const [separatorRadius, setSeparatorRadius] = useState<number>(20);
  const [separatorColor, setSeparatorColor] = useState<string>("#444444");
  const [useShadows, setUseShadows] = useState<boolean>(false);
  const [shadowOffset, setShadowOffset] = useState<number>(5);
  const [shadowSpread, setShadowSpread] = useState<number>(5);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.8);
  const [shadowColor, setShadowColor] = useState<string>("#000000");

  // Given a list of files, find SVG files in a given directory.
  const filterSvgFiles = (files: string[], directory: string) =>
    files
      .filter((file) => file.startsWith(directory))
      .map((file) => file.slice(directory.length, -4));

  // Get a list of all available Ferrises and separators. This code will only run once.
  useEffect(() => {
    fetch(
      "https://api.github.com/repos/vE5li/vE5li.github.io/git/trees/master?recursive=true"
    )
      .then((response) => response.json())
      .then((data) => data.tree.map((item: any) => item.path))
      .then((files: string[]) => {
        setAvailableFerrises(filterSvgFiles(files, "ferrises/"));
        setAvailableSeparators(filterSvgFiles(files, "separators/"));
      });
  }, []);

  // This callback handles messages from the worker thread.
  const workerCallback = (event: MessageEvent<WorkerMessage>) => {
    const { data } = event;

    // The worker has generated our image, so we set the image URL to our new image.
    // By doing so we update the preview at the bottom of the page and also change the
    // file that will be downloaded when clicking the download link.
    if (data.imageUrl) {
      setImageUrl(data.imageUrl);
      setLoading(false);

      // A message without data means that the worker is done initializing and we can generate our image.
    } else {
      setLoading(true);
      generateImage().catch(console.error);
    }
  };

  // This will re-generate the image any time one of the variables below change.
  useEffect(() => {
    worker.terminate();
    worker = new Worker(new URL("./worker/generate.ts", import.meta.url));
    worker.onmessage = workerCallback;
  }, [
    width,
    height,
    ferrisSize,
    spacing,
    backgroundColor,
    ferrises,
    useSeparators,
    separatorType,
    separatorRadius,
    separatorColor,
    useShadows,
    shadowOffset,
    shadowSpread,
    shadowOpacity,
    shadowColor,
  ]);

  // Fetch SVG data as Base64 from GitHub given the name of the file.
  const fetchSvg = async (file: string) => {
    return await fetch(
      "https://raw.githubusercontent.com/vE5li/vE5li.github.io/master/" +
        file +
        ".svg"
    )
      .then((response) => response.text())
      .then((data) => "data:image/svg+xml;base64," + btoa(data));
  };

  // Fetch the SVG data for a Ferris given the name.
  const fetchFerris = async (ferris: string) => {
    const ferrisData = await fetchSvg("ferrises/" + ferris);
    ferrisCache[ferris] = ferrisData;
    return ferrisData;
  };

  // Fetch the SVG data for a separator given the name.
  const fetchSeparator = async (separator: string) => {
    const separatorData = await fetchSvg("separators/" + separator);
    separatorCache[separator] = separatorData;
    return separatorData;
  };

  // Produces an array of strings containing the data for every selected Ferris.
  // The SVG data for each Ferris will either be read from the cache or fetched from GitHub.
  const getFerrisData = async (ferrises: string[]) => {
    return Promise.all(
      ferrises.map(async (ferris) =>
        ferrisCache[ferris]
          ? Promise.resolve(ferrisCache[ferris])
          : fetchFerris(ferris)
      )
    );
  };

  // The SVG data for the separator will either be read from the cache or fetched from GitHub.
  const getSeparatorData = async (separator: string) => {
    return separatorCache[separator]
      ? Promise.resolve(separatorCache[separator])
      : fetchSeparator(separator);
  };

  // Create image parameters from the state and send a message to the worker thread with
  // our input parameters.
  const generateImage = async () => {
    // Fetch all the SVG data needed for the image.
    const ferrisesPromise = getFerrisData(ferrises.map((item) => item.name));
    const separatorPromise = useSeparators
      ? getSeparatorData(separatorType)
      : Promise.resolve("");

    Promise.all([ferrisesPromise, separatorPromise]).then(
      ([ferrisData, separatorData]) => {
        // TypeScript cannot infer the type of our message, so we annotate it manually
        // to make sure all image parameters are set correctly.
        const parameters: ImageParameters = {
          width,
          height,
          ferrisSize,
          spacing,
          backgroundColor,
          ferrisData,
          useSeparators,
          separatorData,
          separatorRadius,
          separatorColor,
          useShadows,
          shadowOffset,
          shadowSpread,
          shadowOpacity,
          shadowColor,
        };

        worker.postMessage(parameters);
      }
    );
  };

  // Entire website body.
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className="App"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          margin: "1rem",
        }}
      >
        {/* Generic image settings */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            border: "6px",
            borderColor: "primary.dark",
            borderLeftStyle: "solid",
            paddingLeft: "1rem",
          }}
        >
          <Typography sx={{ color: "primary.dark" }} fontSize="0.8rem">
            generic image settings. spacing can also be negative.
          </Typography>
          <Grid
            container
            spacing={2}
            columns={10}
            sx={{ "& .MuiGrid-item": { paddingTop: "0.5rem" } }}
          >
            <Grid item xs={10} sm={5} md={2}>
              <NumberInput
                label="width"
                defaultValue={width}
                onChange={setWidth}
              />
            </Grid>
            <Grid item xs={10} sm={5} md={2}>
              <NumberInput
                label="height"
                defaultValue={height}
                onChange={setHeight}
              />
            </Grid>
            <Grid item xs={10} sm={5} md={2}>
              <NumberInput
                label="ferris size"
                defaultValue={ferrisSize}
                onChange={setFerrisSize}
              />
            </Grid>
            <Grid item xs={10} sm={5} md={2}>
              <NumberInput
                label="spacing"
                defaultValue={spacing}
                onChange={setSpacing}
              />
            </Grid>
            <Grid item xs={10} sm={5} md={2}>
              <ColorInput
                label="background color"
                defaultValue={backgroundColor}
                onChange={setBackgroundColor}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Selecting Ferrises */}
        <Box
          sx={{
            border: "6px",
            gap: "1rem",
            borderColor: "primary.dark",
            borderLeftStyle: "solid",
            paddingLeft: "1rem",
          }}
        >
          <Typography sx={{ color: "primary.dark" }} fontSize="0.8rem">
            list of ferrises. the same ferris can be added multiple times. left
            click on an item to remove it from the list. focused items can also
            be moved with the arrow keys and removed by pressing the delete key.
          </Typography>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            border: "6px",
            borderColor: "primary.dark",
            borderLeftStyle: "solid",
            paddingLeft: "1rem",
          }}
        >
          <Typography sx={{ color: "primary.dark" }} fontSize="0.8rem">
            separators between ferrises. checkboxes can be toggled with enter.
          </Typography>
          <StyledCheckbox
            label="separators"
            value={useSeparators}
            setValue={setUseSeparators}
          />
          {useSeparators && (
            <Grid
              container
              spacing={2}
              columns={6}
              sx={{ "& .MuiGrid-item": { paddingTop: "0.5rem" } }}
            >
              <Grid item xs={6} sm={3} md={2}>
                <Select
                  label="separator type"
                  value={separatorType}
                  setValue={setSeparatorType}
                  options={availableSeparators}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <NumberInput
                  label="separator radius"
                  defaultValue={separatorRadius}
                  onChange={setSeparatorRadius}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <ColorInput
                  label="separator color"
                  defaultValue={separatorColor}
                  onChange={setSeparatorColor}
                />
              </Grid>
            </Grid>
          )}
        </Box>
        {/* Drop shadows */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            border: "6px",
            borderColor: "primary.dark",
            borderLeftStyle: "solid",
            paddingLeft: "1rem",
          }}
        >
          <Typography sx={{ color: "primary.dark" }} fontSize="0.8rem">
            drop shadows below ferrises. checkboxes can be toggled with enter.
            opacity must be between 0 and 1.
          </Typography>
          <StyledCheckbox
            label="shadows"
            value={useShadows}
            setValue={setUseShadows}
          />
          {useShadows && (
            <Grid
              container
              spacing={2}
              columns={8}
              sx={{ "& .MuiGrid-item": { paddingTop: "0.5rem" } }}
            >
              <Grid item xs={8} sm={4} md={2}>
                <NumberInput
                  label="shadow offset"
                  defaultValue={shadowOffset}
                  onChange={setShadowOffset}
                />
              </Grid>
              <Grid item xs={8} sm={4} md={2}>
                <NumberInput
                  label="shadow spread"
                  defaultValue={shadowSpread}
                  onChange={setShadowSpread}
                />
              </Grid>
              <Grid item xs={8} sm={4} md={2}>
                <NumberInput
                  label="shadow opacity"
                  defaultValue={shadowOpacity}
                  onChange={setShadowOpacity}
                  validator={(value) => value >= 0 && value <= 1}
                />
              </Grid>
              <Grid item xs={8} sm={4} md={2}>
                <ColorInput
                  label="shadow color"
                  defaultValue={shadowColor}
                  onChange={setShadowColor}
                />
              </Grid>
            </Grid>
          )}
        </Box>
        {/* Image preview and spinner */}
        <Box sx={{ position: "relative", minHeight: "3rem" }}>
          <CircularProgress
            size="2rem"
            sx={{
              position: "absolute",
              zIndex: "1",
              top: "1rem",
              left: "1rem",
              visibility: loading ? "visible" : "hidden",
            }}
          />
          {imageUrl !== undefined && <img src={imageUrl} width="100%" />}
        </Box>
        {/* Download link */}
        {imageUrl !== undefined && (
          <StyledLink
            text="> download image"
            download={"wallpaper.png"}
            href={imageUrl}
            fontSize="1.2rem"
            trigger={
              "https://api.countapi.xyz/hit/oxidize-your-screen/download"
            }
          />
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
        This frontend is made with TypeScript and React and the image generation
        is done in Rust. You can check out the source code on{" "}
        <StyledLink
          text="GitHub"
          href="https://github.com/vE5li/vE5li.github.io"
          fontSize="0.8rem"
          tabIndex={-1}
        />
        . If you would like to add a Ferris or a separator, please open a merge
        request!
      </Typography>
    </ThemeProvider>
  );
}

export default App;
