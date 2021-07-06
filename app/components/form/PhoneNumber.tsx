import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import React, { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";
import { byIso } from "country-code-lookup";
import { useTranslation } from "react-i18next";
import Validations from "../../utils/Validations";
import { HelperText, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";

interface Props extends ControlProps {
  placeholder?: string;
  onSubmit?: () => void;
  wrap?: boolean;
}

interface IPhoneNumber {
  code?: string;
  dialCode?: string;
  number?: string;
}

interface PhoneCode {
  code: string;
  country: string;
  dialCode: string;
}

const phoneCodes: PhoneCode[] = getCountries()
  .map((c) => ({ code: c, country: byIso(c)?.country ?? "", dialCode: `+${getCountryCallingCode(c)}` }))
  .filter((p) => p.country)
  .sort((a, b) => (a.dialCode + a.country > b.dialCode + b.country ? 1 : -1));

// TODO: join with DeFiPicker?
const PhoneNumber = ({
  control,
  name,
  placeholder,
  label,
  rules,
  error,
  disabled = false,
  onSubmit,
  wrap = false,
}: Props) => {
  const { t } = useTranslation();
  const phoneNumber = useWatch({ control, name: name, defaultValue: "" });

  const [showDropDown, setShowDropDown] = useState(false);

  const parseNumber = (): IPhoneNumber => {
    const code = phoneCodes.find((c) => phoneNumber?.startsWith(c.dialCode));
    const number = phoneNumber?.replace(code?.dialCode, "").trimLeft();
    return { code: code?.code, number: number, dialCode: code?.dialCode };
  };
  const updateNumber = (update: Partial<IPhoneNumber>) => {
    const { dialCode, number } = { ...parseNumber(), ...update };
    return dialCode || number ? `${dialCode} ${number}` : "";
  };

  // TODO: improve performance
  // TODO: auto-select phone codes with selected country
  // TODO: does not work with countries with same phone code! (fix with performance)

  const updateRules = (rules?: any): any => ({
    ...rules,
    ...Validations.Phone(t),
  });

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <View style={!wrap && AppStyles.containerHorizontal}>
            <DropDown
              label={label}
              value={parseNumber().code}
              setValue={(value) =>
                onChange(updateNumber({ dialCode: phoneCodes.find((c) => c.code == value)?.dialCode }))
              }
              list={(rules?.required ? [] : [{ label: " ", value: undefined as unknown as string }]).concat(
                phoneCodes?.map((code) => ({ label: `${code.country} ${code.dialCode}`, value: code.code }))
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
            {wrap ? <SpacerV height={5} /> : <SpacerH />}
            <TextInput
              onBlur={onBlur}
              onChangeText={(value) => onChange(updateNumber({ number: value }))}
              value={parseNumber().number ?? ""}
              placeholder={placeholder}
              disabled={disabled}
              error={Boolean(error)}
              onSubmitEditing={onSubmit}
            />
          </View>
          <HelperText type="error" visible={Boolean(error)}>
            {error && error.message}
          </HelperText>
        </>
      )}
      name={name}
      rules={updateRules(rules)}
    />
  );
};

export default PhoneNumber;
