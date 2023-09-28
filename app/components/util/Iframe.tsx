import React from "react";

// use react-native-webview on native?
const Iframe = ({ src, width }: { src: string; width: number }) => {
  return React.createElement("iframe", {
    src: src,
    frameBorder: "0",
    style: { width, height: "800px" },
    allow: "camera *; microphone *",
    allowfullscreen: "",
  });
};

export default Iframe;
