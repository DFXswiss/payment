import React from "react";
import { StyleSheet, View, Text } from "react-native";
import AppStyles from "../styles/AppStyles";

const Row = ({ cells }: { cells: string[] }) => {
  return (
    <View style={AppStyles.row}>
      {cells.map((cell: string, i: number) => (
        <Text key={i} style={AppStyles.cell}>
          {cell}
        </Text>
      ))}
    </View>
  );
};

export default Row;
