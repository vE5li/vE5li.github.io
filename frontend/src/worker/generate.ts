/* eslint-disable no-restricted-globals */
import init, { generate } from "../core/core";

export type ImageParameters = {
  width: number;
  height: number;
  ferrisSize: number;
  spacing: number;
  backgroundColor: string;
  separatorRadius: number;
  separatorColor: string;
  ferrises: string[];
  useSeparators: boolean;
  useCrosses: boolean;
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

  // Fetch SVG data from GitHub given the name of a Ferris and cache the data.
  const fetchFerris = async (ferris: string) => {
    let combined = "";

    const data = await fetch(
      "https://raw.githubusercontent.com/vE5li/ferrises/master/" +
        ferris +
        ".svg"
    );

    if (data.body === null) {
      // TODO: proper handling here
      return "failed";
    }

    const reader = data.body.getReader();

    await reader.read().then(async function foo({ done, value }) {
      if (value) {
        combined += new TextDecoder("utf-8").decode(value);
      }

      if (done) {
        return;
      }

      await reader.read().then(foo);
    });

    const finalData = btoa(combined);
    ferrisCache[ferris] = finalData;
    return finalData;
  };

  // Produces a single string containing the data for every selected Ferris, separated by a newline.
  // The SVG data for each Ferris will either be read from the cache or fetched from GitHub.
  const getFerrisData = async (ferrises: string[]) => {
    const ferrisData = await Promise.all(
      ferrises.map(async (ferris) => {
        return ferrisCache[ferris]
          ? Promise.resolve(ferrisCache[ferris])
          : fetchFerris(ferris);
      })
    );

    return ferrisData.join("\n");
  };

  // This function is called when we received a message from the main thread.
  self.onmessage = (event: MessageEvent<ImageParameters>) => {
    const { data } = event;

    getFerrisData(data.ferrises).then((ferrisData) => {
      const imageData = generate(
        data.width,
        data.height,
        data.ferrisSize,
        data.spacing,
        data.backgroundColor,
        data.separatorRadius,
        data.separatorColor,
        ferrisData,
        data.useSeparators,
        data.useCrosses
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
    });
  };

  // Getting here means that the worker is ready to start generating images, so we send an empty
  // message to inform the main thread. On receiving this message, the main thread will instantly
  // request an image with the default parameters to display as a preview.
  self.postMessage({});
});

export {};
