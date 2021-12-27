import React, { useEffect, useState } from "react";
import { ScaledSize, Dimensions } from "react-native";

// use react-native-webview on native?
const ChatBot = React.memo(({ src, maxWidth }: { src: string; maxWidth: number }) => {
  const getVideoWidth = (screenWidth: number): number =>
    Math.min(maxWidth ?? Infinity, screenWidth);

  const [videoWidth, setVideoWidth] = useState(getVideoWidth(Dimensions.get("window").width));
  const dimensionListener = ({ window }: { window: ScaledSize }) => setVideoWidth(getVideoWidth(window.width));

  useEffect(() => {
    Dimensions.addEventListener("change", dimensionListener);
    return () => Dimensions.removeEventListener("change", dimensionListener);
  }, []);

  return React.createElement("iframe", {
    width: videoWidth,
    height: videoWidth,
    src: src,
    frameBorder: "0",
  });
});

export default ChatBot;
