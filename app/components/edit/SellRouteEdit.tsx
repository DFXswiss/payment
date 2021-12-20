import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
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
import { ApiError } from "../../models/ApiDto";

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
  } = useForm<SellRoute>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => {
    getFiats()
      .then(setFiats)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: SellRoute) => {
    setIsSaving(true);
    setError(undefined);

    // re-activate the route, if it already existed
    const existingRoute = routes?.find((r) => !r.active && r.fiat.id === route.fiat.id &&  r.iban.split(' ').join('') === route.iban.split(' ').join(''));
    if (existingRoute) existingRoute.active = true;

    (existingRoute ? putSellRoute(existingRoute) : postSellRoute(route))
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode == 409 ? "model.route.conflict" : ""))
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
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.your_iban")} placeholder="DE89 3704 0044 0532 0130 00" />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${t(error)}`} />
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
