/* eslint-disable no-restricted-globals */
import init, { generate, Settings } from "../core/core";

export type TsSettings = {
  width: number;
  height: number;
  backgroundColor: string;
  ferrises: string[];
  ferrisSize: number;
  ferrisOffset: number;
  showCircles: boolean;
  circleRadius: number;
  circleColor: string;
  useCrosses: boolean;
};

export type ReadyMessage = {
  state: "ready";
};

export type ImageUrlMessage = {
  state: "data";
  data: string;
};

export type WorkerMessage = ReadyMessage | ImageUrlMessage;

init().then(() => {
  let ferrisCache: Record<string, string> = {};

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

  self.onmessage = (event: MessageEvent<TsSettings>) => {
    const { data } = event;

    getFerrisData(data.ferrises).then((ferrisData) => {
      const settings = new Settings(
        data.width,
        data.height,
        data.backgroundColor,
        ferrisData,
        data.ferrisSize,
        data.ferrisOffset,
        data.showCircles,
        data.circleRadius,
        data.circleColor,
        data.useCrosses
      );

      const imageData = generate(settings);
      const url = URL.createObjectURL(
        new Blob([imageData], {
          type: "image/png",
        })
      );

      const message: ImageUrlMessage = {
        state: "data",
        data: url,
      };

      self.postMessage(message);
    });
  };

  const message: ReadyMessage = {
    state: "ready",
  };

  self.postMessage(message);
});

export {};
