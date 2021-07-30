import React, { ReactNode } from "react";
import { StyleSheet, StyleProp, TextStyle } from "react-native";
import { DataTable } from "react-native-paper";
import { DefaultCursor } from "../styles/AppStyles";

interface Props {
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

export const CompactCell = ({ children, style, ...props }: Props) => (
  <DataTable.Cell style={[styles.cell, style]} {...props}>
    {children}
  </DataTable.Cell>
);

const styles = StyleSheet.create({
  header: {
    height: "unset"
  },
  title: {
    paddingVertical: 0,
  },
  row: {
    minHeight: 30,
    ...DefaultCursor
  },
  cell: DefaultCursor
});
