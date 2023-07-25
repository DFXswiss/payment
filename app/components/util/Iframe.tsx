import React from "react";
import Sizes from "../../config/Sizes";

// use react-native-webview on native?
const Iframe = ({ src }: { src: string }) => {
  return React.createElement("iframe", {
    src: src,
    frameBorder: "0",
    style: { width: Sizes.AppWidth, height: "800px" },
    allow: "camera *; microphone *",
    allowfullscreen: "",
  });
};

export default Iframe;
