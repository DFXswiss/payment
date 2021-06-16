import React from "react";
import { Text, TextStyle, TouchableOpacity } from "react-native";
import AppStyles from "../styles/AppStyles";

export const H1 = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Text style={[AppStyles.h1, style]}>{text}</Text>
);

export const ActionLink = ({ action, label, style }: { action: () => void; label: string, style?: TextStyle }) => (
  <TouchableOpacity onPress={action} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);
