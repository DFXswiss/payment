import React from "react";
import { TextStyle, View } from "react-native";
import { Title, Text } from "react-native-paper";
import Colors from "../config/Colors";
import AppStyles from "../styles/AppStyles";

export const H1 = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Title style={[AppStyles.h1, style]}>{text}</Title>
);
export const H2 = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Title style={[AppStyles.h2, style]}>{text}</Title>
);
export const H3 = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Title style={[AppStyles.h3, style]}>{text}</Title>
);
export const H4 = ({ text, style }: { text: string; style?: TextStyle }) => (
  <Title style={[AppStyles.h4, style]}>{text}</Title>
);

export const T5 = ({ text, style }: { text: string; style?: TextStyle | any }) => (
  <Text style={[{fontSize: 14}, style]}>{text}</Text>
);

export const Alert = ({ label }: { label: string }) => (
  <View style={AppStyles.error}>
    <Text style={[AppStyles.b, { color: Colors.White }]}>{label}</Text>
  </View>
);
