import { Picker } from "@react-native-picker/picker";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import React from "react";
import { Controller, useWatch } from "react-hook-form";
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import Colors from "../../config/Colors";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { ControlProps } from "./Form";
import { byIso } from "country-code-lookup";
import { useTranslation } from "react-i18next";
import Validations from "../../utils/Validations";
import { Text } from "react-native-paper";

interface Props extends ControlProps {
  placeholder?: string;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  wrap?: boolean;
}

interface IPhoneNumber {
  code?: string;
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
  .sort((a, b) => (a.dialCode + a.country) > (b.dialCode + b.country) ? 1 : -1);

// TODO: join with DeFiPicker?
const PhoneNumber = ({
  control,
  name,
  placeholder,
  label,
  labelStyle,
  rules,
  error,
  editable = true,
  onKeyPress,
  wrap = false,
}: Props) => {
  const { t } = useTranslation();
  const phoneNumber = useWatch({ control, name: "phoneNumber", defaultValue: "" });

  // TODO: improve performance
  const parseNumber = (): IPhoneNumber => {
    const code = phoneCodes.find((c) => phoneNumber?.startsWith(c.dialCode))?.dialCode;
    const number = phoneNumber?.replace(code, "").trimLeft();
    return { code, number };
  };
  const updateNumber = (update: Partial<IPhoneNumber>) => {
    const { code, number } = { ...parseNumber(), ...update };
    return code || number ? `${code} ${number}` : "";
  };

  // TODO: auto-select phone codes with selected country

  // TODO: bug when undefined-select (only if form already submitted)
  const updateRules = (rules?: any): any => ({
    ...rules,
    ...Validations.Phone(t),
  });

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          {label && <Text style={[AppStyles.label, labelStyle]}>{label}</Text>}
          <View style={!wrap && AppStyles.containerHorizontal}>
            <Picker
              style={[
                AppStyles.control,
                error && { borderColor: Colors.Error },
                !editable && AppStyles.controlDisabled, // TODO: this color is different than input's ???
              ]}
              selectedValue={parseNumber().code}
              onValueChange={(itemValue, itemIndex) => onChange(updateNumber({ code: itemValue }))}
              enabled={editable}
            >
              {!rules?.required && <Picker.Item label="" value={undefined} />}
              {phoneCodes?.map((code) => (
                <Picker.Item key={code.code} label={`${code.country} ${code.dialCode}`} value={code.dialCode} />
              ))}
            </Picker>
            { wrap ? <SpacerV height={5} /> : <SpacerH />}
            <TextInput
              onBlur={onBlur}
              onChangeText={(val) => onChange(updateNumber({ number: val }))}
              value={parseNumber().number ?? ""}
              style={[
                AppStyles.control,
                error && { borderColor: Colors.Error },
                !editable && AppStyles.controlDisabled,
              ]}
              placeholder={placeholder}
              editable={editable}
              onKeyPress={onKeyPress}
              placeholderTextColor={Colors.LightGrey}
            />
          </View>
          <Text style={AppStyles.textError}>{error && error.message}</Text>
        </>
      )}
      name={name}
      rules={updateRules(rules)}
    />
  );
};

export default PhoneNumber;
