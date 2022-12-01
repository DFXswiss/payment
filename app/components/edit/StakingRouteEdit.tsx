import React, { useEffect, useState, MutableRefObject } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { StakingRoute, PayoutType } from "../../models/StakingRoute";
import { getAssets, postStakingRoute, putStakingRoute } from "../../services/ApiService";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Validations from "../../utils/Validations";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { HelperText } from "react-native-paper";
import { ApiError } from "../../models/ApiDto";
import { SellRoute } from "../../models/SellRoute";
import { View } from "react-native";
import AppStyles from "../../styles/AppStyles";
import NotificationService from "../../services/NotificationService";
import { Asset } from "../../models/Asset";
import Loading from "../util/Loading";

enum SellType {
  REWARD = "Reward",
  PAYBACK = "Payback",
}

const StakingRouteEdit = ({
  route,
  routes,
  onRouteCreated,
  sells,
  createSellRoute,
  newSellRouteCreated,
}: {
  route?: StakingRoute;
  routes?: StakingRoute[];
  onRouteCreated: (route: StakingRoute) => void;
  sells?: SellRoute[];
  createSellRoute: () => void;
  newSellRouteCreated: MutableRefObject<((route: SellRoute) => void) | undefined>;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StakingRoute>({ defaultValues: route });
  const rewardType = useWatch({ control, name: "rewardType", defaultValue: undefined });
  const paybackType = useWatch({ control, name: "paybackType", defaultValue: undefined });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [newSellRouteType, setNewSellRouteType] = useState<SellType | undefined>();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    newSellRouteCreated.current = (newSellRoute: SellRoute) => {
      if (newSellRoute && newSellRouteType) {
        setValue(newSellRouteType === SellType.REWARD ? "rewardSell" : "paybackSell", newSellRoute, {
          shouldValidate: true,
        });
      }
    };
  });

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
          (update.rewardType !== PayoutType.BANK_ACCOUNT || r.rewardSell?.id === update.rewardSell?.id) &&
          (update.rewardType !== PayoutType.WALLET || r.rewardAsset?.id === update.rewardAsset?.id) &&
          r.paybackType === update.paybackType &&
          (update.paybackType !== PayoutType.BANK_ACCOUNT || r.paybackSell?.id === update.paybackSell?.id) &&
          (update.paybackType !== PayoutType.WALLET || r.paybackAsset?.id === update.paybackAsset?.id)
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
    rewardSell: rewardType === PayoutType.BANK_ACCOUNT && Validations.Required,
    rewardAsset: rewardType === PayoutType.WALLET && Validations.Required,
    paybackType: Validations.Required,
    paybackSell: paybackType === PayoutType.BANK_ACCOUNT && Validations.Required,
    paybackAsset: paybackType === PayoutType.WALLET && Validations.Required,
  });

  const newSellRouteButton = (type: SellType) => (
    <View style={[AppStyles.containerHorizontal, { justifyContent: "flex-end" }]}>
      <DeFiButton
        onPress={() => {
          setNewSellRouteType(type);
          createSellRoute();
        }}
        compact
      >
        {t("model.route.new_sell")}
      </DeFiButton>
    </View>
  );
  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="rewardType"
        label={t("model.route.reward")}
        items={[PayoutType.WALLET]}
        labelFunc={(i) => t(`model.route.${i.toLowerCase()}`)}
      />
      <SpacerV />

      {rewardType === PayoutType.BANK_ACCOUNT && (
        <>
          <DeFiPicker
            name="rewardSell"
            label={t("model.route.reward_sell")}
            items={sells ?? []}
            idFunc={(i) => i.id}
            labelFunc={(i) => `${i.fiat.name} - ${i.iban}`}
          />
          {newSellRouteButton(SellType.REWARD)}
          <SpacerV />
        </>
      )}

      {rewardType === PayoutType.WALLET && (
        <>
          <DeFiPicker
            name="rewardAsset"
            label={t("model.route.reward_asset")}
            items={assets.filter((a) => a.buyable)}
            idFunc={(i) => i.id}
            labelFunc={(i) => i.name}
          />
          <SpacerV />
        </>
      )}

      <DeFiPicker
        name="paybackType"
        label={t("model.route.payback")}
        items={[PayoutType.WALLET]}
        labelFunc={(i) => t(`model.route.${i.toLowerCase()}`)}
      />
      {route != null && route.paybackType !== paybackType && (
        <HelperText type="info" style={AppStyles.right}>
          {t("model.route.edit_payback")}
        </HelperText>
      )}
      <SpacerV />

      {paybackType === PayoutType.BANK_ACCOUNT && (
        <>
          <DeFiPicker
            name="paybackSell"
            label={t("model.route.payback_sell")}
            items={sells ?? []}
            idFunc={(i) => i.id}
            labelFunc={(i) => `${i.fiat.name} - ${i.iban}`}
          />
          {newSellRouteButton(SellType.PAYBACK)}
          <SpacerV />
        </>
      )}

      {paybackType === PayoutType.WALLET && (
        <>
          <DeFiPicker
            name="paybackAsset"
            label={t("model.route.payback_asset")}
            items={assets.filter((a) => a.buyable)}
            idFunc={(i) => i.id}
            labelFunc={(i) => i.name}
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
