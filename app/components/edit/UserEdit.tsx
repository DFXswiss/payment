import React, { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MailRegex } from "../../config/Regex";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { Country } from "../../models/Country";
import { User } from "../../models/User";
import { getCountries, putUser } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import LoadingButton from "../LoadingButton";

interface Props {
  isVisible: boolean;
  user?: User;
  onUserChanged: (user: User) => void;
}

const UserEdit = ({ isVisible, user, onUserChanged }: Props) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<User>({ defaultValues: useMemo(() => user, [user]) });

  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => reset(user), [isVisible]);
  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  const onSubmit = (user: User) => {
    setIsSaving(true);
    putUser(user)
      .then((user) => onUserChanged(user))
      .finally(() => setIsSaving(false));
  };

  const rules: any = {
    mail: {
      pattern: {
        value: MailRegex,
        message: t("validation.pattern_invalid"),
      },
    },
    usedRef: {
      pattern: {
        value: /^\d{3}-\d{3}$/,
        message: t("validation.pattern_invalid"),
      },
    },
  };

  return (
    <Form control={control} rules={rules} errors={errors} editable={!isSaving} onSubmit={handleSubmit(onSubmit)}>
      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="firstName" label={t("model.user.first_name")} />
        <SpacerH />
        <Input name="lastName" label={t("model.user.last_name")} />
      </View>
      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="street" label={t("model.user.street")} />
        <SpacerH />
        <Input name="houseNumber" label={t("model.user.house_number")} />
      </View>
      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="zip" label={t("model.user.zip")} />
        <SpacerH />
        <Input name="location" label={t("model.user.location")} />
      </View>
      <DeFiPicker name="country" label={t("model.user.country")} items={countries.filter((c) => c.enable)} idProp="id" labelProp="name" />
      <SpacerV />
      <Input name="mail" label={t("model.user.mail")} />
      {/* TODO: ländervorwahl */}
      <Input name="phoneNumber" label={t("model.user.phone_number")} />
      <SpacerV />
      <Input name="usedRef" label={t("model.user.used_ref")} placeholder="xxx-xxx" />
      <SpacerV />

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <LoadingButton title={t("action.save")} isLoading={isSaving} onPress={handleSubmit(onSubmit)} />
      </View>
    </Form>
  );
};

export default UserEdit;
