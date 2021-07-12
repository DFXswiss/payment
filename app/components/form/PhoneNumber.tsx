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
  code?: PhoneCode;
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
  const [phoneCode, setPhoneCode] = useState<PhoneCode>();

  const parseNumber = (): IPhoneNumber => {
    const code = phoneCode ?? phoneCodes.find((c) => phoneNumber?.startsWith(c.dialCode));
    const tempNumber = phoneNumber?.replace(code?.dialCode, "").trimLeft();
    return { code: code, number: tempNumber };
  };
  const updateCode = (code?: PhoneCode): string => {
    const { number } = parseNumber();
    setPhoneCode(code);
    return getNumber(code, number);
  }
  const updateNumber = (number?: string): string => {
    const { code } = parseNumber();
    return getNumber(code, number);
  };
  const getNumber = (code?: PhoneCode, number?: string) => {
    return code?.dialCode || number ? `${code?.dialCode} ${number}` : "";
  }

  // TODO: auto-select phone codes with selected country
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
              value={parseNumber().code?.code}
              setValue={(value) =>
                onChange(updateCode(phoneCodes.find((c) => c.code == value)))
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
              onChangeText={(value) => onChange(updateNumber(value))}
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
