import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableRipple, Checkbox as PaperCheckbox, Paragraph } from "react-native-paper";
import Loading from "../components/util/Loading";
import Colors from "../config/Colors";
import { DefaultCursor } from "../styles/AppStyles";

interface CheckboxProps {
  label: string;
  onPress: () => void;
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const Checkbox = ({ label, onPress, checked, disabled, loading }: CheckboxProps) => {
  return (
    <TouchableRipple onPress={onPress} disabled={disabled} style={disabled && DefaultCursor}>
      <View style={styles.checkRow}>
        <View pointerEvents="none">
          {loading ? (
            <Loading size={20} style={{ marginRight: 16 }} />
          ) : (
            <PaperCheckbox status={checked ? "checked" : "unchecked"} disabled={disabled} />
          )}
        </View>
        <Paragraph style={disabled && { color: Colors.Disabled }}>{label}</Paragraph>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
