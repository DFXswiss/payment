import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { StyleSheet, View, Text, TextInput, TextStyle } from "react-native";
import Colors from "../config/Colors";

interface Props {
  control?: Control<any>;
  name: string;
  placeholder?: string;
  label?: string;
  labelStyle?: TextStyle;
  rules?: any;
  error?: FieldError | undefined;
}

const Input = ({ control, name, placeholder, label, labelStyle, rules, error }: Props) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View>
          {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
          <TextInput
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            value={value ?? ""}
            style={[styles.input, { borderColor: error ? Colors.Error : Colors.Grey }]}
            placeholder={placeholder}
          />
          <Text style={styles.textError}>{error && error.message}</Text>
        </View>
      )}
      name={name}
      rules={rules}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 5,
    paddingLeft: 5,
    height: 40,
    color: Colors.Black,
    fontSize: 14,
  },
  label: {
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.Grey,
  },
  textError: {
    color: Colors.Error,
  },
});

export default Input;
