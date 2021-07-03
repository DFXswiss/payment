import React from "react";
import { Controller } from "react-hook-form";
import { ReturnKeyTypeOptions } from "react-native";
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { Text } from "react-native-paper";
import Colors from "../../config/Colors";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  placeholder?: string;
  onSubmit?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  secureTextEntry?: boolean;
}

// TODO: focus next field 
const Input = ({ control, name, placeholder, label, labelStyle, rules, error, editable = true, onSubmit, returnKeyType, secureTextEntry = false }: Props) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={AppStyles.cell}>
          {label && <Text style={[AppStyles.label, labelStyle]}>{label}</Text>}
          <TextInput
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            value={value ?? ""}
            style={[AppStyles.control, error && { borderColor: Colors.Error }, !editable && AppStyles.controlDisabled]}
            placeholder={placeholder}
            editable={editable}
            onSubmitEditing={onSubmit}
            returnKeyType={returnKeyType}
            placeholderTextColor={Colors.LightGrey}
            secureTextEntry={secureTextEntry}
          />
          <Text style={AppStyles.textError}>{error && error.message}</Text>
        </View>
      )}
      name={name}
      rules={rules}
    />
  );
};

export default Input;
