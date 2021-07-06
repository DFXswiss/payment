import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Asset } from "../../models/Asset";
import { BuyRoute } from "../../models/BuyRoute";
import { getAssets, postBuyRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";

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
  } = useForm<BuyRoute>();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    reset({ asset: assets[0] });
    setError(false);
  }, [isVisible]);
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => NotificationService.show(t("feedback.load_failed")));
  }, []);

  const onSubmit = (route: BuyRoute) => {
    setIsSaving(true);
    setError(false);

    postBuyRoute(route)
      .then((newRoute) => onRouteCreated(newRoute))
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  // TODO: react on collisions (buy&sell)

  const rules: any = {
    asset: Validations.Required(t),
    iban: { ...Validations.Required(t), ...Validations.Iban(t) },
  };

  return (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="asset"
        label={t("model.route.asset")}
        items={assets.filter((a) => a.buyable)}
        idProp="id"
        labelProp="name"
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.iban")} placeholder="DE89 3704 0044 0532 0130 00" />
      <SpacerV />

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </View>
    </Form>
  );
};

export default BuyRouteEdit;
