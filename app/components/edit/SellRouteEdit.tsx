import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerV } from "../../elements/Spacers";
import { Fiat } from "../../models/Fiat";
import { NewSellRoute, SellRoute } from "../../models/SellRoute";
import { getFiats } from "../../services/ApiService";
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
  } = useForm<NewSellRoute>();

  const [isSaving, setIsSaving] = useState(false);
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => reset({ fiatId: fiats[0]?.id }), [isVisible]);
  useEffect(() => {
    getFiats().then((fiats) => setFiats(fiats));
  }, []);

  const onSubmit = (route: NewSellRoute) => {
    setIsSaving(true);
    // postSellRoute(route).then((route) => {
    // onRouteCreated(route);
    setIsSaving(false);
    // });
    // TODO: finally!
    // TODO: finally everywhere!
  };

  const rules: any = {
    fiatId: {
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
        name="fiatId"
        label={t("model.route.fiat")}
        items={fiats.map((fiat) => ({ id: fiat.id, label: fiat.name }))}
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

export default SellRouteEdit;
