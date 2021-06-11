import React from "react";
import { StyleSheet, View, Text } from "react-native";

const Row = ({ cells }: { cells: string[] }) => {
  return (
    <View style={styles.row}>
      {cells.map((cell: string, i: number) => (
        <Text key={i} style={styles.cell}>
          {cell}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignSelf: "stretch",
  },
});

export default Row;
