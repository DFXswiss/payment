import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { ApiError } from "../../models/ApiDto";
import { Asset, AssetCategory } from "../../models/Asset";
import { AllowedCryptoBlockchains, Blockchain } from "../../models/Blockchain";
import { CryptoRoute } from "../../models/CryptoRoute";
import { getAssets, postCryptoRoute } from "../../services/ApiService";
import { Session } from "../../services/AuthService";
import NotificationService from "../../services/NotificationService";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import ButtonContainer from "../util/ButtonContainer";
import Loading from "../util/Loading";

const CryptoRouteEdit = ({
  onRouteCreated,
  session,
}: {
  onRouteCreated: (route: CryptoRoute) => void;
  session?: Session;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CryptoRoute & { targetBlockchain: Blockchain }>();
  const asset = useWatch({ control, name: "asset" });
  const targetBlockchain = useWatch({ control, name: "targetBlockchain" });
  const sourceBlockchain = useWatch({ control, name: "blockchain" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: CryptoRoute) => {
    setIsSaving(true);
    setError(undefined);

    postCryptoRoute(route)
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode === 409 ? "model.route.conflict" : ""))
      .finally(() => setIsSaving(false));
  };

  const isBlockchainsEnabled = (): boolean => {
    return getBlockchains().length > 1;
  };

  const getBlockchains = (): Blockchain[] => {
    return session?.blockchains ?? [];
  };

  const getBuyableAssets = (values: Asset[]): Asset[] => {
    return values.filter((a) => (targetBlockchain ? a.blockchain === targetBlockchain : true) && a.buyable);
  };

  const showAssetWarning = (): boolean =>
    asset?.category === AssetCategory.STOCK ||
    (asset?.category === AssetCategory.POOL_PAIR && asset?.name.includes("DUSD"));

  const rules: any = createRules({
    blockchain: Validations.Required,
    asset: Validations.Required,
    targetBlockchain: [
      isBlockchainsEnabled() && Validations.Required,
      Validations.Custom((b) => (b == sourceBlockchain ? "model.route.blockchain_same" : true)),
    ],
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="blockchain"
        label={t("model.route.deposit_blockchain")}
        items={Object.values(Blockchain)
          .filter((b) => AllowedCryptoBlockchains.includes(b))
          .filter((b) => (isBlockchainsEnabled() ? true : b !== session?.blockchains?.[0]))}
        labelFunc={(i) => i}
      />
      <SpacerV />

      {isBlockchainsEnabled() && (
        <>
          <DeFiPicker
            name="targetBlockchain"
            label={t("model.route.target_blockchain")}
            items={getBlockchains().filter((b) => b !== sourceBlockchain)}
            labelFunc={(i) => i}
          />
          <SpacerV />
        </>
      )}

      <DeFiPicker
        name="asset"
        label={t("model.route.target_asset")}
        items={getBuyableAssets(assets)}
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
        disabled={isBlockchainsEnabled() && targetBlockchain == null}
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

export default CryptoRouteEdit;
