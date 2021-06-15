import React from "react";
import { View, Text, TextStyle } from "react-native";
import AppStyles from "../styles/AppStyles";

// TODO: responsive table
const Row = ({ cells, layout, textStyle }: { cells: string[], layout?: number[], textStyle?: TextStyle }) => {
  return (
    <View style={AppStyles.row}>
      {cells.map((cell: string, i: number) => (
        <Text key={i} style={[AppStyles.cell, textStyle, {flex: layout ? layout[i] : 1 }]}>
          {cell}
        </Text>
      ))}
    </View>
  );
};

export default Row;
