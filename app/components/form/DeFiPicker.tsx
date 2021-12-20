import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { HelperText, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  items: any[];
  idFunc?: (item: any) => any;
  labelFunc?: (item: any) => string;
}

// TODO: empty option moves label
const DeFiPicker = ({ control, name, label, rules, error, disabled, items, idFunc = (i) => i, labelFunc = (i) => i }: Props) => {
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <DropDown
            label={label}
            value={value && idFunc(value)}
            setValue={(value) => onChange(value ? items.find((i) => idFunc(i) == value) : null)}
            list={(rules?.required ? [] : [{ label: " ", value: null as unknown as string }]).concat(
              items?.map((i) => ({ label: labelFunc(i), value: idFunc(i) }))
            )}
            visible={showDropDown}
            showDropDown={() => setShowDropDown(!disabled)}
            onDismiss={() => setShowDropDown(false)}
            inputProps={{
              onBlur: onBlur,
              right: <TextInput.Icon name={"menu-down"} />,
              error: Boolean(error),
              disabled: disabled,
            }}
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error && error.message}
          </HelperText>
        </>
      )}
      name={name}
      rules={rules}
    />
  );
};

export default DeFiPicker;
