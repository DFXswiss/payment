import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { getFiats, postSellRoute, putSellRoute } from "../../services/ApiService";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ActivityIndicator } from "react-native-paper";

const SellRouteEdit = ({
  routes,
  onRouteCreated,
}: {
  routes?: SellRoute[];
  onRouteCreated: (route: SellRoute) => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellRoute>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => {
    reset({ fiat: fiats[0] });
    setError(false);
  }, []);
  useEffect(() => {
    getFiats()
      .then(setFiats)
      .catch(() => NotificationService.show(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: SellRoute) => {
    setIsSaving(true);
    setError(false);


    // re-activate the route, if it already existed
    const existingRoute = routes?.find((r) => !r.active && r.fiat.id === route.fiat.id && r.iban === route.iban);
    if (existingRoute) existingRoute.active = true;

    (existingRoute ? putSellRoute(existingRoute) : postSellRoute(route))
      .then((newRoute) => onRouteCreated(newRoute))
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    fiat: Validations.Required,
    iban: [Validations.Required, Validations.Iban],
  });

  return isLoading ? (
    <ActivityIndicator size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
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

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default SellRouteEdit;
