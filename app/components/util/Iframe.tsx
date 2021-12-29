import Sizes from "../../config/Sizes";
import React, { useEffect, useState } from "react";
import { ScaledSize, Dimensions } from "react-native";

// use react-native-webview on native?
const Iframe = React.memo(({ src, maxWidth }: { src: string; maxWidth?: number }) => {
  const getIframeWidth = (screenWidth: number): number =>
    Math.min(maxWidth ?? Sizes.AppWidth, screenWidth - 2 * Sizes.AppPadding);

  const [iframeWidth, setIframeWidth] = useState(getIframeWidth(Dimensions.get("window").width));
  const dimensionListener = ({ window }: { window: ScaledSize }) => setIframeWidth(getIframeWidth(window.width));

  useEffect(() => {
    Dimensions.addEventListener("change", dimensionListener);
    return () => Dimensions.removeEventListener("change", dimensionListener);
  }, []);

  return React.createElement("iframe", {
    width: iframeWidth,
    height: iframeWidth, // TODO!
    src: src,
    frameBorder: "0",
  });
});

export default Iframe;
