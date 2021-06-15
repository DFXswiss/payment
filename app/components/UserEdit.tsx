import React, { useEffect } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import Colors from "../config/Colors";
import { SpacerH, SpacerV } from "../elements/Elements";
import { User } from "../models/User";
import AppStyles from "../styles/AppStyles";
import Form from "./Form";
import Input from "./Input";

// TODO: save on enter
const UserEdit = ({ user, onUserChanged }: { user?: User; onUserChanged: (user: User) => void }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<User>({ defaultValues: useMemo(() => user, [user]) });

  useEffect(() => {
    reset(user);
  }, [user]);

  const onSubmit = (user: User) => onUserChanged(user);

  const rules: any = {
    mail: {
      pattern: {
        value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
    <View>
      <Form control={control} rules={rules} errors={errors}>
        <View style={AppStyles.containerHorizontal}>
          <Input name="firstName" label={t("model.user.first_name")} />
          <SpacerH />
          <Input name="lastName" label={t("model.user.last_name")} />
        </View>
        <Input name="street" label={t("model.user.street")} />
        <View style={AppStyles.containerHorizontal}>
          <Input name="zip" label={t("model.user.zip")} />
          <SpacerH />
          <Input name="location" label={t("model.user.location")} />
        </View>
        <Input name="mail" label={t("model.user.mail")} />
        <Input name="phoneNumber" label={t("model.user.phone_number")} />
        <SpacerV />
        <Input name="usedRef" label={t("model.user.used_ref")} placeholder="xxx-xxx" />
        <SpacerV />

        <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
          <Button color={Colors.Primary} title={t("action.save")} onPress={handleSubmit(onSubmit)} />
        </View>
      </Form>
    </View>
  );
};

export default UserEdit;
