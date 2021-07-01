import React, { ReactElement } from "react";
import { View, TextStyle } from "react-native";
import { Text } from "react-native-paper";
import AppStyles from "../../styles/AppStyles";

// TODO: responsive table
const Row = ({ cells, layout, textStyle }: { cells: (string | ReactElement)[], layout?: (number | undefined)[], textStyle?: TextStyle }) => {
  return (
    <View style={AppStyles.row}>
      {cells.map((cell: string | ReactElement, i: number) => (
        <View key={i} style={[AppStyles.cell, { flex: layout ? layout[i] : 1 }]}>
          {typeof cell === "string" ? <Text style={textStyle}>{cell}</Text> : <>{ cell }</>}
        </View>
      ))}
    </View>
  );
};

export default Row;
