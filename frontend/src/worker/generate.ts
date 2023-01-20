/* eslint-disable no-restricted-globals */
import init, { generate } from "../core/core";

export type ImageParameters = {
  width: number;
  height: number;
  ferrisSize: number;
  spacing: number;
  backgroundColor: string;
  ferrisData: string[];
  useSeparators: boolean;
  separatorData: string;
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
  // This function is called when we received a message from the main thread.
  self.onmessage = (event: MessageEvent<ImageParameters>) => {
    const { data } = event;

    // TODO: why is this needed
    if (data.ferrisData === undefined) {
      return;
    }

    // Call into Rust to with our settings.
    const imageData = generate(
      data.width,
      data.height,
      data.ferrisSize,
      data.spacing,
      data.backgroundColor,
      data.ferrisData,
      data.useSeparators,
      data.separatorData,
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
  };

  // Getting here means that the worker is ready to start generating images, so we send an empty
  // message to inform the main thread. On receiving this message, the main thread will instantly
  // request an image with the default parameters to display as a preview.
  self.postMessage({});
});

export {};
