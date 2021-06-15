import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import { Spacer } from "../elements/Elements";
import { User } from "../models/User";
import Input from "./Input";

const UserEdit = ({ user }: { user?: User }) => {
  const { t } = useTranslation();

  const { control, handleSubmit, formState: { errors }, } = useForm<User>({ defaultValues: user });

  const onSubmit = (user: User) => console.log(user);

  const rules: any = { };

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
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

export default UserEdit;
