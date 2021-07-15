import React from "react";
import { View } from "react-native";

export const Spacer = ({ size = 10}: {size?: number}) => <View style={{ height: size, width: size }} />;
export const SpacerV = ({ height = 10 }: { height?: number }) => <View style={{ height: height }} />;
export const SpacerH = ({ width = 10 }: { width?: number }) => <View style={{ width: width }} />;