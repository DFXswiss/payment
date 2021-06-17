import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerV } from "../../elements/Spacers";
import { BuyRoute } from "../../models/BuyRoute";
import { postBuyRoute } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import Form from "../form/Form";
import Input from "../form/Input";
import LoadingButton from "../LoadingButton";

const NewBuyRoute = ({
  isVisible,
  onRouteCreated,
}: {
  isVisible: boolean;
  onRouteCreated: (route: BuyRoute) => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuyRoute>();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => reset(), [isVisible]);

  const onSubmit = (route: BuyRoute) => {
    setIsSaving(true);
    // postBuyRoute(route).then((route) => {
      onRouteCreated(route);
      setIsSaving(false);
    // });
    // TODO: finally!
  };

  const rules: any = {
    asset: {
      required: {
        value: true,
        message: t("validation.required"),
      },
    },
    iban: {
      required: {
        value: true,
        message: t("validation.required"),
      },
      pattern: {
        value: /^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/,
        message: t("validation.pattern_invalid"),
      },
    },
  };

  return (
    <Form control={control} rules={rules} errors={errors} onSubmit={handleSubmit(onSubmit)}>
      {/* TODO: picker */}
      <Input name="asset" label={t("model.route.asset")} />
      <SpacerV />
      <Input name="iban" label={t("model.route.iban")} />
      <SpacerV />

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <LoadingButton title={t("action.save")} isLoading={isSaving} onPress={handleSubmit(onSubmit)} />
      </View>
    </Form>
  );
};

export default NewBuyRoute;
