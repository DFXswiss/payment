import React from "react";
import { TextStyle, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import AppStyles from "../styles/AppStyles";

export const ActionLink = ({ onPress, label, style }: { onPress: () => void; label: string; style?: TextStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);