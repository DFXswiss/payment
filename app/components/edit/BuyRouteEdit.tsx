import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerV } from "../../elements/Spacers";
import { Asset } from "../../models/Asset";
import { BuyRoute, NewBuyRoute } from "../../models/BuyRoute";
import { getAssets } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import LoadingButton from "../LoadingButton";

const BuyRouteEdit = ({
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
  } = useForm<NewBuyRoute>();

  const [isSaving, setIsSaving] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => reset({assetId: assets[0]?.id}), [isVisible]);
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const onSubmit = (route: NewBuyRoute) => {
    setIsSaving(true);
    // postBuyRoute(route).then((route) => {
    // onRouteCreated(route);
    setIsSaving(false);
    // });
    // TODO: finally!
    // TODO: finally everywhere!
  };

  const rules: any = {
    assetId: {
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
      <DeFiPicker
        name="assetId"
        label={t("model.route.asset")}
        items={assets}
        idProp="id"
        labelProp="name"
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.iban")} />
      <SpacerV />

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <LoadingButton title={t("action.save")} isLoading={isSaving} onPress={handleSubmit(onSubmit)} />
      </View>
    </Form>
  );
};

export default BuyRouteEdit;
