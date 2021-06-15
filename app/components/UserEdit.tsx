import React, { useEffect } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import Colors from "../config/Colors";
import { Spacer } from "../elements/Elements";
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

  const rules: any = { firstName: { required: true } }; // TODO

  return (
    <View>
      <Form control={control} rules={rules} errors={errors}>
        <Input name="firstName" label={t("model.user.first_name")} />
        <Spacer />
        <Input name="lastName" label={t("model.user.last_name")} />
        <Spacer />
        <Input name="street" label={t("model.user.street")} />
        <Spacer />
        <Input name="zip" label={t("model.user.zip")} />
        <Spacer />
        <Input name="location" label={t("model.user.location")} />
        <Spacer />
        <Input name="mail" label={t("model.user.mail")} />
        <Spacer />
        <Input name="phoneNumber" label={t("model.user.phone_number")} />
        <Spacer />

        <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
          <Button color={Colors.Primary} title={t("action.save")} onPress={handleSubmit(onSubmit)} />
        </View>
      </Form>
    </View>
  );
};

export default UserEdit;
