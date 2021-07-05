import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { View, TextInput, TextInputProps } from "react-native";
import { Text } from "react-native-paper";
import Colors from "../../config/Colors";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  onSubmit?: () => void;
}

const Input = forwardRef<TextInput, Props & TextInputProps>(({ control, name, label, labelStyle, rules, error, editable = true, onSubmit, ...props }: Props & TextInputProps, ref) => {
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
            editable={editable}
            onSubmitEditing={onSubmit}
            placeholderTextColor={Colors.LightGrey}
            ref={ref}
            {...props}
          />
          <Text style={AppStyles.textError}>{error && error.message}</Text>
        </View>
      )}
      name={name}
      rules={rules}
    />
  );
});

export default Input;
