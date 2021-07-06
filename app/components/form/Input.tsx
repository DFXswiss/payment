import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  onSubmit?: () => void;
}

const Input = forwardRef<any, any>(({ control, name, label, rules, error, disabled = false, onSubmit, ...props }: Props, ref) => {
    return (
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={AppStyles.cell}>
            <TextInput
              label={label}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value ?? ""}
              error={Boolean(error)}
              disabled={disabled}
              onSubmitEditing={onSubmit}
              ref={ref}
              {...props}
            />
            <HelperText type="error" visible={Boolean(error)}>
              {error && error.message}
            </HelperText>
          </View>
        )}
        name={name}
        rules={rules}
      />
    );
  }
);

export default Input;
