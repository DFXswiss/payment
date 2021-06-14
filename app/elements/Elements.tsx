import React from "react";
import { View } from "react-native";

export const Spacer = ({height = 10}: {height?: number}) => <View style={{ height: height}} />;
