import React, { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import Colors from "../config/Colors";
import { SpacerH, SpacerV } from "../elements/Spacers";
import { User } from "../models/User";
import { putUser } from "../services/ApiService";
import AppStyles from "../styles/AppStyles";
import Form from "./Form";
import Input from "./Input";
import Loading from "./Loading";

const UserEdit = ({ user, onUserChanged }: { user?: User; onUserChanged: (user: User) => void }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<User>({ defaultValues: useMemo(() => user, [user]) });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    reset(user);
  }, [user]);

  const onSubmit = (user: User) => {
    setIsSaving(true);
    putUser(user).then((user) => {
      onUserChanged(user);
      setIsSaving(false);
    });
  };

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
      <Form control={control} rules={rules} errors={errors} editable={!isSaving} onSubmit={handleSubmit(onSubmit)}>
        <View style={AppStyles.containerHorizontalWrap}>
          <Input name="firstName" label={t("model.user.first_name")} />
          <SpacerH />
          <Input name="lastName" label={t("model.user.last_name")} />
        </View>
        <Input name="street" label={t("model.user.street")} />
        <View style={AppStyles.containerHorizontalWrap}>
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
          <View style={isSaving && AppStyles.hidden}>
            <Button
              color={Colors.Primary}
              title={t("action.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={isSaving}
            />
          </View>
          <>{isSaving && <Loading />}</>
        </View>
      </Form>
    </View>
  );
};

export default UserEdit;
