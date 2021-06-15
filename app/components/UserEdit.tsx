import React, { useEffect } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import Colors from "../config/Colors";
import { Spacer } from "../elements/Elements";
import { User } from "../models/User";
import AppStyles from "../styles/AppStyles";
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

  const rules: any = {}; // TODO

  return (
    // TODO: wrapper
    <View>
      <Input
        control={control}
        name="firstName"
        label={t("model.user.first_name")}
        error={errors.firstName}
        rules={rules.firstName}
      />
      <Spacer />
      <Input
        control={control}
        name="lastName"
        label={t("model.user.last_name")}
        error={errors.lastName}
        rules={rules.lastName}
      />
      <Spacer />
      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <Button color={Colors.Primary} title={t("action.save")} onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  );
};

export default UserEdit;
