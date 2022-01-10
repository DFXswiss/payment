import React, { ReactNode } from "react";
import { StyleSheet, StyleProp, TextStyle, View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import Colors from "../config/Colors";
import { DefaultCursor } from "../styles/AppStyles";

interface Props {
  multiLine?: boolean;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

export const CompactHeader = ({ children, style, ...props }: Props) => (
  <DataTable.Header style={[styles.header, style]} {...props}>
    <>{children}</>
  </DataTable.Header>
);

export const CompactTitle = ({ children, style, ...props }: Props) => (
  <DataTable.Title style={[styles.title, style]} {...props}>
    {children}
  </DataTable.Title>
);

export const CompactRow = ({ children, style, ...props }: Props) => (
  <DataTable.Row style={[styles.row, style]} {...props}>
    {children}
  </DataTable.Row>
);

export const CompactCell = ({ multiLine = false, children, style, ...props }: Props) =>
  multiLine ? (
    <View style={[styles.multiLineCell, style]}>
      <Text>{children}</Text>
    </View>
  ) : (
    <DataTable.Cell style={[styles.cell, style]} {...props}>
      {children}
    </DataTable.Cell>
  );

const styles = StyleSheet.create({
  header: {
    height: "unset",
  },
  title: {
    paddingVertical: 0,
  },
  row: {
    minHeight: 30,
    backgroundColor: Colors.LightBlue,
    borderBottomColor: Colors.Blue,
    ...DefaultCursor,
  },
  cell: DefaultCursor,
  multiLineCell: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 3,
  },
});
