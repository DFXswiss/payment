import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { Text } from "react-native-paper";
import Colors from "../../config/Colors";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  items: any[];
  idProp: string;
  labelProp: string;
}

const DeFiPicker = ({
  control,
  name,
  label,
  labelStyle,
  rules,
  error,
  editable,
  items,
  idProp,
  labelProp,
}: Props) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={AppStyles.cell}>
          {label && <Text style={[AppStyles.label, labelStyle]}>{label}</Text>}
          <Picker
            style={[AppStyles.control, error && { borderColor: Colors.Error }, !editable && AppStyles.controlDisabled]}
            selectedValue={value && value[idProp]}
            onValueChange={(itemValue, itemIndex) => onChange(items.find((i) => i[idProp] == itemValue))}
            enabled={editable}
          >
            {!rules?.required && <Picker.Item label="" value={undefined} />}
            {items?.map((item) => (
              <Picker.Item key={item[idProp]} label={item[labelProp]} value={item[idProp]} />
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
