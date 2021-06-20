import React from "react";
import { Text, TextStyle, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import AppStyles from "../styles/AppStyles";

export const ActionLink = ({ onPress, label, style }: { onPress: () => void; label: string; style?: TextStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);

export const IconButton = ({ icon, onPress, style, color }: { icon: string, onPress: () => void, style?: TextStyle, color: string}) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Icon name={icon} color={color} />
  </TouchableOpacity>
);