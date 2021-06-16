import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Dimensions } from "react-native";

// use react-native-webview on native?
const VideoPlayer = ({ src, maxWidth }: { src: string; maxWidth: number }) => {
  const getVideoWidth = (screenWidth: number): number => Math.min(maxWidth ?? Infinity, screenWidth - 20); // TODO: global variables

  const [videoWidth, setVideoWidth] = useState(getVideoWidth(Dimensions.get("window").width));

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window }) => setVideoWidth(getVideoWidth(window.width)));
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
