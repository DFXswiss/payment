import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { IbanRegex } from "../../config/Regex";
import { SpacerV } from "../../elements/Spacers";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
import { getFiats, postSellRoute } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import LoadingButton from "../LoadingButton";

const SellRouteEdit = ({
  isVisible,
  onRouteCreated,
}: {
  isVisible: boolean;
  onRouteCreated: (route: SellRoute) => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellRoute>();

  const [isSaving, setIsSaving] = useState(false);
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => reset({ fiat: fiats[0] }), [isVisible]);
  useEffect(() => {
    getFiats().then(setFiats);
  }, []);

  const onSubmit = (route: SellRoute) => {
    setIsSaving(true);
    postSellRoute(route)
      .then((route) => onRouteCreated(route))
      .finally(() => setIsSaving(false));
  };

  const rules: any = {
    fiat: {
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
        value: IbanRegex,
        message: t("validation.pattern_invalid"),
      },
    },
  };

  return (
    <Form control={control} rules={rules} errors={errors} editable={!isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker name="fiat" label={t("model.route.fiat")} items={fiats.filter((f) => f.enable)} idProp="id" labelProp="name" />
      <SpacerV />

      <Input name="iban" label={t("model.route.iban")} />
      <SpacerV />

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <LoadingButton title={t("action.save")} isLoading={isSaving} onPress={handleSubmit(onSubmit)} />
      </View>
    </Form>
  );
};

export default SellRouteEdit;
