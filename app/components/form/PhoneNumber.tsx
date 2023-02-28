import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import React, { useEffect, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";
import { byIso } from "country-code-lookup";
import Validations from "../../utils/Validations";
import { HelperText, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { join } from "../../utils/Utils";

interface Props extends ControlProps {
  placeholder?: string;
  onSubmit?: () => void;
  wrap?: boolean;
  country?: string;
}

interface PhoneNumber {
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
  country,
}: Props) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [phoneCode, setPhoneCode] = useState<PhoneCode>();

  const value = useWatch({ control, name: "phone" });

  const parseNumber = (phoneNumber: string): PhoneNumber => {
    const code = phoneCode ?? phoneCodes.find((c) => phoneNumber?.startsWith(c.dialCode));
    const tempNumber = phoneNumber?.replace(code?.dialCode ?? "", "").trimLeft();
    return { code: code, number: tempNumber };
  };
  const updateCode = (currentNumber: PhoneNumber, code?: PhoneCode): string => {
    setPhoneCode(code);
    return getNumber(code, currentNumber.number);
  };
  const updateNumber = (currentNumber: PhoneNumber, number?: string): string => {
    return getNumber(currentNumber.code, number?.replace(" ", ""));
  };
  const getNumber = (code?: PhoneCode, number?: string) => {
    return join([code?.dialCode, number], "");
  };

  useEffect(() => {
    if (!value) {
      setPhoneCode(phoneCodes.find((c) => c.code === country));
    }
  }, [country]);

  const updateRules = (rules?: any): any => ({
    ...rules,
    ...Validations.Phone,
  });

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => {
        const phoneNumber = parseNumber(value);
        return (
          <>
            <View style={!wrap && AppStyles.containerHorizontal}>
              <DropDown
                label={label}
                value={phoneNumber.code?.code}
                setValue={(value) =>
                  onChange(
                    updateCode(
                      phoneNumber,
                      phoneCodes.find((c) => c.code == value)
                    )
                  )
                }
                list={(rules?.required ? [] : [{ label: " ", value: undefined as unknown as string }]).concat(
                  phoneCodes?.map((code) => ({ label: `${code.dialCode} ${code.country}`, value: code.code }))
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
                onChangeText={(value) => onChange(updateNumber(phoneNumber, value))}
                value={phoneNumber.number ?? ""}
                placeholder={placeholder}
                disabled={disabled}
                error={Boolean(error)}
                onSubmitEditing={onSubmit}
                style={AppStyles.cell}
              />
            </View>
            <HelperText type="error" visible={Boolean(error)}>
              {error && error.message}
            </HelperText>
          </>
        );
      }}
      name={name}
      rules={updateRules(rules)}
    />
  );
};

export default PhoneNumber;
