import React from "react";
import { TextStyle, TouchableOpacity } from "react-native";
import { Button, Text } from "react-native-paper";
import AppStyles from "../styles/AppStyles";

export const ActionLink = ({ onPress, label, style }: { onPress: () => void; label: string; style?: TextStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);

export const DeFiButton = ({ loading, disabled, ...props }: any) => (
  <Button loading={loading} disabled={loading || disabled} contentStyle={(loading || disabled) && { cursor: "default" }} {...props}>
    {props.children}
  </Button>
);
