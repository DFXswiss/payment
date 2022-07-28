import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { Country } from "../../models/Country";
import { AccountType, KycInfo } from "../../models/User";
import { getCountries, putKycData } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { Alert, H3, H4 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ApiError } from "../../models/ApiDto";
import { KycData } from "../../models/KycData";
import Loading from "../util/Loading";

interface Props {
  code: string;
  kycData?: KycData;
  onChanged: (kycData: KycData, info: KycInfo) => void;
}

const KycDataEdit = ({ code, kycData, onChanged }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KycData>({ defaultValues: kycData });
  const accountType = useWatch({ control, name: "accountType" });
  const country = useWatch({ control, name: "country" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (updatedData: KycData) => {
    setIsSaving(true);
    setError(undefined);

    putKycData(updatedData, code)
      .then((info) => onChanged(updatedData, info))
      .catch((error: ApiError) => setError(error.statusCode === 409 ? "feedback.mail_error" : ""))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    phone: Validations.Required,
    mail: [Validations.Mail, Validations.Required],

    accountType: Validations.Required,
    firstName: Validations.Required,
    lastName: Validations.Required,
    street: Validations.Required,
    houseNumber: Validations.Required,
    zip: Validations.Required,
    location: Validations.Required,
    country: Validations.Required,

    organizationName: Validations.Required,
    organizationStreet: Validations.Required,
    organizationHouseNumber: Validations.Required,
    organizationLocation: Validations.Required,
    organizationZip: Validations.Required,
    organizationCountry: Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <SpacerV />
      <H3 text={t("model.user.kyc_data")} />
      <DeFiPicker
        name="accountType"
        label={t("model.user.account_type")}
        items={Object.values(AccountType)}
        labelFunc={(i) => t(`model.user.${i.toLowerCase()}`)}
      />
      <SpacerV />

      {accountType !== AccountType.PERSONAL && <H4 text={t("model.user.personal_info")} />}

      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="firstName" label={t("model.user.first_name")} />
        <SpacerH />
        <Input name="lastName" label={t("model.user.last_name")} />
      </View>
      <SpacerV />
      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="street" label={t("model.user.street")} />
        <SpacerH />
        <Input name="houseNumber" label={t("model.user.house_number")} />
      </View>
      <SpacerV />
      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="zip" label={t("model.user.zip")} />
        <SpacerH />
        <Input name="location" label={t("model.user.location")} />
      </View>
      <SpacerV />
      <DeFiPicker
        name="country"
        label={t("model.user.country")}
        items={countries.filter((c) => c.enable)}
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
      />
      <SpacerV />

      {accountType !== AccountType.PERSONAL && (
        <>
          <H4 text={t("model.user.organization_info")} />
          <Input name="organizationName" label={t("model.user.organization_name")} />
          <SpacerV />
          <View style={AppStyles.containerHorizontalWrap}>
            <Input name="organizationStreet" label={t("model.user.street")} />
            <SpacerH />
            <Input name="organizationHouseNumber" label={t("model.user.house_number")} />
          </View>
          <SpacerV />
          <View style={AppStyles.containerHorizontalWrap}>
            <Input name="organizationZip" label={t("model.user.zip")} />
            <SpacerH />
            <Input name="organizationLocation" label={t("model.user.location")} />
          </View>
          <SpacerV />
          <DeFiPicker
            name="organizationCountry"
            label={t("model.user.country")}
            items={countries.filter((c) => c.enable)}
            idFunc={(i) => i.id}
            labelFunc={(i) => i.name}
          />
          <SpacerV />
        </>
      )}

      <H3 text={t("model.user.contact_data")} />

      <Input name="mail" label={t("model.user.mail")} valueHook={(v: string) => v.trim()} />
      <SpacerV />
      <PhoneNumber
        name="phone"
        label={t("model.user.mobile_number")}
        placeholder="1761212112"
        wrap={!device.SM}
        country={country?.symbol}
      />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${error ? t(error) : ""}`} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default KycDataEdit;
