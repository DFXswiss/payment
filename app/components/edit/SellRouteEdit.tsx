import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { IbanRegex } from "../../config/Regex";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { getFiats, postSellRoute } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import LoadingButton from "../util/LoadingButton";

const SellRouteEdit = ({
  isVisible,
  onRouteCreated,
  user,
}: {
  isVisible: boolean;
  onRouteCreated: (route: SellRoute) => void;
  user?: User;
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
      .then((newRoute) => onRouteCreated(newRoute))
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

  const userDataMissing = () =>
    !(user?.firstName && user?.lastName && user?.street && user?.zip && user?.location && user?.country && user?.phoneNumber);

  return (
    <Form control={control} rules={rules} errors={errors} editable={!isSaving} onSubmit={handleSubmit(onSubmit)}>
      <Alert label={t("model.user.data_missing")} />
      <DeFiPicker
        name="fiat"
        label={t("model.route.fiat")}
        items={fiats.filter((f) => f.enable)}
        idProp="id"
        labelProp="name"
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.iban")} placeholder="DE89 3704 0044 0532 0130 00" />
      <SpacerV />

      <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
        <LoadingButton
          title={t("action.save")}
          disabled={userDataMissing()}
          isLoading={isSaving}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </Form>
  );
};

export default SellRouteEdit;
