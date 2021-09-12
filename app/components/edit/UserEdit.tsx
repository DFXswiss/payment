import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { Country } from "../../models/Country";
import { User } from "../../models/User";
import { getCountries, putUser } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { Alert } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ActivityIndicator } from "react-native-paper";

interface Props {
  user?: User;
  onUserChanged: (user: User) => void;
  allDataRequired: boolean;
}

const UserEdit = ({ user, onUserChanged, allDataRequired }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({ defaultValues: user});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => NotificationService.show(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (updatedUser: User) => {
    setIsSaving(true);
    setError(false);

    putUser(updatedUser)
      .then(onUserChanged)
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    firstName: allDataRequired && Validations.Required,
    lastName: allDataRequired && Validations.Required,
    street: allDataRequired && Validations.Required,
    houseNumber: allDataRequired && Validations.Required,
    zip: allDataRequired && Validations.Required,
    location: allDataRequired && Validations.Required,
    country: allDataRequired && Validations.Required,
    mobileNumber: allDataRequired && Validations.Required,
    mail: [Validations.Mail, allDataRequired && Validations.Required],
    usedRef: Validations.Ref,
  });

  return isLoading ? (
    <ActivityIndicator size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      {allDataRequired && (
        <>
          <Alert label={t("model.user.data_missing")} />
          <SpacerV />
        </>
      )}
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
        idProp="id"
        labelProp="name"
      />
      <SpacerV />
      <Input name="mail" label={t("model.user.mail")} />
      <SpacerV />
      <PhoneNumber
        name="mobileNumber"
        label={t("model.user.mobile_number")}
        placeholder="6912345678"
        wrap={!device.SM}
      />
      <SpacerV />
      <Input name="refData.usedRef" label={t("model.user.used_ref")} placeholder="xxx-xxx" />
      <SpacerV />

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t(allDataRequired ? "action.next" : "action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default UserEdit;
