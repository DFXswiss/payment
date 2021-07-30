import React, { useEffect, useState } from "react";
import { ScaledSize, Dimensions } from "react-native";
import Sizes from "../../config/Sizes";

// use react-native-webview on native?
const VideoPlayer = ({ src, maxWidth }: { src: string; maxWidth: number }) => {
  const getVideoWidth = (screenWidth: number): number =>
    Math.min(maxWidth ?? Infinity, screenWidth - 2 * Sizes.AppPadding);

  const [videoWidth, setVideoWidth] = useState(getVideoWidth(Dimensions.get("window").width));
  const dimensionListener = ({ window }: { window: ScaledSize }) => setVideoWidth(getVideoWidth(window.width));

  useEffect(() => {
    Dimensions.addEventListener("change", dimensionListener);
    return () => Dimensions.removeEventListener("change", dimensionListener);
  }, []);

  return React.createElement("iframe", {
    width: videoWidth,
    height: 0.5625 * videoWidth,
    src: src,
    frameBorder: "0",
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
  });
};

export default VideoPlayer;
