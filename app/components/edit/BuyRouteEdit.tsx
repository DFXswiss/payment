import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Session } from "../../services/AuthService";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { ApiError } from "../../models/ApiDto";
import { Asset, AssetCategory } from "../../models/Asset";
import { BuyRoute } from "../../models/BuyRoute";
import { getAssets, postBuyRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import ButtonContainer from "../util/ButtonContainer";
import Loading from "../util/Loading";
import { Blockchain } from "../../models/Blockchain";

const BuyRouteEdit = ({
  onRouteCreated,
  session,
}: {
  onRouteCreated: (route: BuyRoute) => void;
  session?: Session;
}) => {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuyRoute & { blockchain?: Blockchain }>();
  const asset = useWatch({ control, name: "asset" });
  const blockchain = useWatch({ control, name: "blockchain" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssets()
      .then(updateAssets)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    reset({ blockchain: blockchain, asset: undefined });
  }, [blockchain]);

  const onSubmit = (route: BuyRoute) => {
    setIsSaving(true);
    setError(undefined);

    postBuyRoute(route)
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode == 409 ? "model.route.conflict" : ""))
      .finally(() => setIsSaving(false));
  };

  const showAssetWarning = (): boolean =>
    asset?.category === AssetCategory.STOCK ||
    (asset?.category === AssetCategory.POOL_PAIR && asset?.name.includes("DUSD"));

  const getBuyableAssets = (values: Asset[]): Asset[] => {
    return values.filter((a) => (blockchain ? a.blockchain === blockchain : true) && a.buyable);
  };

  const updateAssets = (values: Asset[]) => {
    setAssets(values);
    const buyableAssets = getBuyableAssets(values);
    if (buyableAssets.length === 1) setValue("asset", buyableAssets[0]);
  };

  const isBlockchainsEnabled = (): boolean => {
    return getBlockchains().length > 1;
  };

  const getBlockchains = (): Blockchain[] => {
    return session?.blockchains ?? [];
  };

  const rules: any = createRules({
    type: Validations.Required,
    asset: Validations.Required,
    blockchain: isBlockchainsEnabled() && Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      {isBlockchainsEnabled() && (
        <>
          <DeFiPicker
            name="blockchain"
            label={t("model.route.blockchain")}
            items={getBlockchains()}
            labelFunc={(i) => i}
          />
          <SpacerV />
        </>
      )}

      <DeFiPicker
        name="asset"
        label={t("model.route.asset")}
        items={getBuyableAssets(assets)}
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
        disabled={isBlockchainsEnabled() && blockchain == null}
      />
      {showAssetWarning() && (
        <>
          <Alert label={t("model.route.exchange_rate_warning")} />
          <SpacerV />
        </>
      )}
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

export default BuyRouteEdit;
