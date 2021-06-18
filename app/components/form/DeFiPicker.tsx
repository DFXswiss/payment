import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Controller } from "react-hook-form";
import { View, Text } from "react-native";
import Colors from "../../config/Colors";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";

export interface Item {
  id: any;
  label: string;
}

interface Props extends ControlProps {
  items: Item[];
}

// TODO: onBlur
const DeFiPicker = ({ control, name, label, labelStyle, rules, error, editable, items }: Props) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={AppStyles.cell}>
          {label && <Text style={[AppStyles.label, labelStyle]}>{label}</Text>}
          <Picker
            style={[AppStyles.control, error && { borderColor: Colors.Error }, !editable && AppStyles.controlDisabled]}
            selectedValue={value}
            onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
            enabled={editable}
          >
            {items?.map((item) => (
              <Picker.Item key={item.id} label={item.label} value={item.id} />
            ))}
          </Picker>
          <Text style={AppStyles.textError}>{error && error.message}</Text>
        </View>
      )}
      name={name}
      rules={rules}
    />
  );
};

export default DeFiPicker;
