import React from "react";
import { TextStyle, TouchableOpacity } from "react-native";
import { Button, Text } from "react-native-paper";
import AppStyles from "../styles/AppStyles";

export const ActionLink = ({ onPress, label, style }: { onPress: () => void; label: string; style?: TextStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);

// TODO: use the paper button props?
export const DeFiButton = ({ link, loading, disabled, ...props }: any) => (
  <Button
    loading={loading}
    disabled={loading || disabled}
    contentStyle={[props.contentStyle, (loading || disabled) && { cursor: "default" }]}
    labelStyle={[props.labelStyle, link && AppStyles.buttonLink]}
    {...props}
  >
    {props.children}
  </Button>
);
