import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { HelperText, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { ControlProps } from "./Form";

interface Props extends ControlProps {
  items: any[];
  idProp: string;
  labelProp: string;
}

// TODO: empty option moves label
const DeFiPicker = ({ control, name, label, rules, error, disabled, items, idProp, labelProp }: Props) => {
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <DropDown
            label={label}
            value={value && value[idProp]}
            setValue={(value) => onChange(items.find((i) => i[idProp] == value))}
            list={(rules?.required ? [] : [{ label: " ", value: undefined as unknown as string }]).concat(
              items?.map((item) => ({ label: item[labelProp], value: item[idProp] }))
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
