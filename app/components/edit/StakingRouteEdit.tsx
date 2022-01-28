import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { StakingRoute, StakingType } from "../../models/StakingRoute";
import { postStakingRoute, putStakingRoute } from "../../services/ApiService";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Validations from "../../utils/Validations";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ActivityIndicator } from "react-native-paper";
import { ApiError } from "../../models/ApiDto";
import { SellRoute } from "../../models/SellRoute";

const StakingRouteEdit = ({
  route,
  routes,
  onRouteCreated,
  sells,
}: {
  route?: StakingRoute;
  routes?: StakingRoute[];
  onRouteCreated: (route: StakingRoute) => void;
  sells?: SellRoute[];
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StakingRoute>({ defaultValues: route });
  const rewardType = useWatch({ control, name: "rewardType", defaultValue: undefined });
  const paybackType = useWatch({ control, name: "paybackType", defaultValue: undefined });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = (update: StakingRoute) => {
    setIsSaving(true);
    setError(undefined);

    if (route) {
      // update
      putStakingRoute(update)
        .then(onRouteCreated)
        .catch(() => setError(""))
        .finally(() => setIsSaving(false));
    } else {
      // re-activate the route, if it already existed
      const existingRoute = routes?.find(
        (r) =>
          !r.active &&
          r.rewardType === update.rewardType &&
          (update.rewardType !== StakingType.PAYOUT || r.rewardSell?.id === update.rewardSell?.id) &&
          r.paybackType === update.paybackType &&
          (update.paybackType !== StakingType.PAYOUT || r.paybackSell?.id === update.paybackSell?.id)
      );
      if (existingRoute) existingRoute.active = true;

      (existingRoute ? putStakingRoute(existingRoute) : postStakingRoute(update))
        .then(onRouteCreated)
        .catch((error: ApiError) => setError(error.statusCode == 409 ? "model.route.conflict" : ""))
        .finally(() => setIsSaving(false));
    }
  };

  const rules: any = createRules({
    rewardType: Validations.Required,
    rewardSell: rewardType === StakingType.PAYOUT && Validations.Required,
    paybackType: Validations.Required,
    paybackSell: paybackType === StakingType.PAYOUT && Validations.Required,
  });

  return isLoading ? (
    <ActivityIndicator size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="rewardType"
        label={t("model.route.reward")}
        items={Object.values(StakingType)}
        labelFunc={(i) => t(`model.route.${i.toLowerCase()}`)}
      />
      <SpacerV />

      {rewardType === StakingType.PAYOUT && (
        <>
          <DeFiPicker
            name="rewardSell"
            label={t("model.route.reward_sell")}
            items={sells ?? []}
            idFunc={(i) => i.id}
            labelFunc={(i) => `${i.fiat.name} - ${i.iban}`}
          />
          <SpacerV />
        </>
      )}

      <DeFiPicker
        name="paybackType"
        label={t("model.route.payback")}
        items={Object.values(StakingType)}
        labelFunc={(i) => t(`model.route.${i.toLowerCase()}`)}
      />
      <SpacerV />

      {paybackType === StakingType.PAYOUT && (
        <>
          <DeFiPicker
            name="paybackSell"
            label={t("model.route.payback_sell")}
            items={sells ?? []}
            idFunc={(i) => i.id}
            labelFunc={(i) => `${i.fiat.name} - ${i.iban}`}
          />
          <SpacerV />
        </>
      )}

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

export default StakingRouteEdit;
