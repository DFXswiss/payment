import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableRipple, RadioButton as PaperRadioButton, Paragraph } from "react-native-paper";
import Loading from "../components/util/Loading";
import { DefaultCursor } from "../styles/AppStyles";

interface RadioButtonProps {
  label: string;
  onPress: () => void;
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const RadioButton = ({ label, onPress, checked, disabled, loading }: RadioButtonProps) => {
  return (
    <TouchableRipple onPress={onPress} disabled={disabled} style={disabled && DefaultCursor}>
      <View style={styles.radioRow}>
        <View pointerEvents="none">
          {loading ? (
            <Loading size={20} style={{ marginRight: 16 }} />
          ) : (
            <PaperRadioButton value="dfx" status={checked ? "checked" : "unchecked"} disabled={disabled} />
          )}
        </View>
        <Paragraph>{label}</Paragraph>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
