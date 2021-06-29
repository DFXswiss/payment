import React, { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { Country } from "../../models/Country";
import { User } from "../../models/User";
import { getCountries, putUser } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import LoadingButton from "../util/LoadingButton";
import Validations from "../../utils/Validations";

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
    mail: Validations.Mail(t),
    usedRef: Validations.Ref(t),
  };

  // TODO: dimensions API, hook?
  // Breakpoint	Class infix	Dimensions
  // X-Small	None	<576px
  // Small	sm	≥576px
  // Medium	md	≥768px
  // Large	lg	≥992px
  // Extra large	xl	≥1200px
  // Extra extra large	xxl	≥1400px
  return (
    <Form control={control} rules={rules} errors={errors} editable={!isSaving} onSubmit={handleSubmit(onSubmit)}>
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
      <DeFiPicker name="country" label={t("model.user.country")} items={countries.filter((c) => c.enable)} idProp="id" labelProp="name" />
      <SpacerV />
      <Input name="mail" label={t("model.user.mail")} />
      <SpacerV />
      <PhoneNumber name="phoneNumber" label={t("model.user.phone_number")} placeholder="69 1234 5678" wrap={Dimensions.get("window").width < 576} />
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
