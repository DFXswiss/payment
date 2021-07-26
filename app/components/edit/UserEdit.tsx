import React, { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
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

interface Props {
  isVisible: boolean;
  user?: User;
  onUserChanged: (user: User) => void;
}

const UserEdit = ({ isVisible, user, onUserChanged }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<User>({ defaultValues: useMemo(() => user, [user]) });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    reset(user);
    setError(false);
  }, [isVisible]);
  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => NotificationService.show(t("feedback.load_failed")));
  }, []);
  // TODO: isLoading (on every edit component!)

  const onSubmit = (updatedUser: User) => {
    setIsSaving(true);
    setError(false);

    putUser(updatedUser)
      .then((user) => onUserChanged(user))
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  const rules: any = {
    mail: Validations.Mail(t),
    usedRef: Validations.Ref(t),
  };

  return (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
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
      <Input name="usedRef" label={t("model.user.used_ref")} placeholder="xxx-xxx" />
      <SpacerV />

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>{t("action.save")}</DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default UserEdit;
