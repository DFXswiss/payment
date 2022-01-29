import React from "react";
// use react-native-webview on native?
const Iframe = ({ src }: { src: string }) => {
  return React.createElement("iframe", {
    src: src,
    frameBorder: "0",
    style: { flex: 1 },
    allow: "camera *; microphone *",
  });
};

export default Iframe;
