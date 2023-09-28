import React from "react";

// use react-native-webview on native?
const Iframe = ({ src, width, height }: { src: string; width: number; height: number }) => {
  return React.createElement("iframe", {
    src: src,
    frameBorder: "0",
    style: { width, height },
    allow: "camera *; microphone *",
    allowfullscreen: "",
  });
};

export default Iframe;
