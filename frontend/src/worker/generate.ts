/* eslint-disable no-restricted-globals */
import init, { generate } from "../core/core";

export type ImageParameters = {
  width: number;
  height: number;
  ferrisSize: number;
  spacing: number;
  backgroundColor: string;
  ferrises: string[];
  useSeparators: boolean;
  separatorType: string;
  separatorRadius: number;
  separatorColor: string;
  useShadows: boolean;
  shadowOffset: number;
  shadowSpread: number;
  shadowOpacity: number;
  shadowColor: string;
};

// A WorkerMessage is sent from the worker to the main thread. This message is first sent after
// the worker is initialized so it does not contain an image URL, but rather trigger the generation
// of a new image to be displayed. Otherwise this message is used to update the image URL after
// generating a new image.
export type WorkerMessage = { imageUrl?: string };

// Initialize Wasm.
init().then(() => {
  // This will cache the SVG any data that is fetched from the Ferris repository (https://github.com/vE5li/ferrises)
  // so we don't do duplicate work.
  let ferrisCache: Record<string, string> = {};
  let separatorCache: Record<string, string> = {};

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

  // This function is called when we received a message from the main thread.
  self.onmessage = (event: MessageEvent<ImageParameters>) => {
    const { data } = event;

    // TODO: why is this needed
    if (data.ferrises === undefined) {
      return;
    }

    // Fetch all the SVG data needed for the image.
    const ferrisesPromise = getFerrisData(data.ferrises);
    const separatorPromise = data.useSeparators
      ? getSeparatorData(data.separatorType)
      : Promise.resolve("");

    // Reslove SVG data and call into Rust.
    Promise.all([ferrisesPromise, separatorPromise]).then(
      ([ferrisData, separatorData]) => {
        const imageData = generate(
          data.width,
          data.height,
          data.ferrisSize,
          data.spacing,
          data.backgroundColor,
          ferrisData,
          data.useSeparators,
          separatorData,
          data.separatorRadius,
          data.separatorColor,
          data.useShadows,
          data.shadowOffset,
          data.shadowSpread,
          data.shadowOpacity,
          data.shadowColor
        );

        // Create a blob containing our image data and set the MIME type to PNG.
        // If we don't set the mime type here some browsers will download the image as a txt file.
        const imageBlob = new Blob([imageData], {
          type: "image/png",
        });

        // Create a URL to our binary blob.
        const imageUrl = URL.createObjectURL(imageBlob);

        // Send the new image to the main thread.
        self.postMessage({ imageUrl });
      }
    );
  };

  // Getting here means that the worker is ready to start generating images, so we send an empty
  // message to inform the main thread. On receiving this message, the main thread will instantly
  // request an image with the default parameters to display as a preview.
  self.postMessage({});
});

export {};
