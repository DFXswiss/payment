import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Session } from "../../services/AuthService";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { ApiError } from "../../models/ApiDto";
import { Asset, AssetCategory } from "../../models/Asset";
import { BuyRoute, BuyType } from "../../models/BuyRoute";
import { getAssets, getCountries, postBuyRoute, putBuyRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import ButtonContainer from "../util/ButtonContainer";
import { StakingRoute } from "../../models/StakingRoute";
import { Country } from "../../models/Country";
import Loading from "../util/Loading";
import { Blockchain } from "../../models/Blockchain";

const BuyRouteEdit = ({
  routes,
  onRouteCreated,
  stakingRoutes,
  session,
}: {
  routes?: BuyRoute[];
  onRouteCreated: (route: BuyRoute) => void;
  stakingRoutes?: StakingRoute[];
  session?: Session;
}) => {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyRoute & { blockchain?: Blockchain }>();
  const type = useWatch({ control, name: "type" });
  const asset = useWatch({ control, name: "asset" });
  const blockchain = useWatch({ control, name: "blockchain" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const buyTypePreselection = getBuyTypePreselection();
    if (buyTypePreselection) setValue("type", buyTypePreselection);

    const blockchains = getBlockchains();
    if (blockchains.length === 1) setValue("blockchain", blockchains[0]);

    Promise.all([getAssets(), getCountries()])
      .then(([a, c]) => {
        updateAssets(a);
        setCountries(c);
      })
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: BuyRoute) => {
    setIsSaving(true);
    setError(undefined);

    // re-activate the route, if it already existed
    const existingRoute = routes?.find(
      (r) =>
        !r.active &&
        (route.type !== BuyType.WALLET || r.asset?.id === route.asset?.id) &&
        (route.type !== BuyType.STAKING || r.staking?.id === route.staking?.id) &&
        r.iban.split(" ").join("") === route.iban.split(" ").join("")
    );
    if (existingRoute) existingRoute.active = true;

    (existingRoute ? putBuyRoute(existingRoute) : postBuyRoute(route))
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode == 409 ? "model.route.conflict" : ""))
      .finally(() => setIsSaving(false));
  };

  const showAssetWarning = (): boolean =>
    asset?.category === AssetCategory.STOCK ||
    (asset?.category === AssetCategory.POOL_PAIR && asset?.name.includes("DUSD"));

  const getBuyTypes = (): BuyType[] => {
    return getBlockchains().includes(Blockchain.DEFICHAIN) ? Object.values(BuyType) : [BuyType.WALLET];
  };

  const getBuyTypePreselection = (): BuyType | undefined => {
    const availableBuyTypes = getBuyTypes();
    return availableBuyTypes.length === 1 ? availableBuyTypes[0] : undefined;
  };

  const getBuyableAssets = (values: Asset[]): Asset[] => {
    return values.filter((a) => a.blockchain === blockchain && a.buyable);
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
    asset: type === BuyType.WALLET && Validations.Required,
    staking: type === BuyType.STAKING && Validations.Required,
    iban: [Validations.Required, Validations.Iban(countries)],
    blockchain: type === BuyType.WALLET && isBlockchainsEnabled() && Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="type"
        label={t("model.route.type")}
        items={getBuyTypes()}
        labelFunc={(i) => t(`model.route.${i.toLowerCase()}`)}
      />
      <SpacerV />

      {type === BuyType.WALLET && (
        <>
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
        </>
      )}

      {type === BuyType.STAKING && (
        <>
          <DeFiPicker
            name="staking"
            label={t("model.route.staking")}
            items={stakingRoutes ?? []}
            idFunc={(i) => i.id}
            labelFunc={(i: StakingRoute) =>
              `${t("model.route." + i.rewardType.toLowerCase())} - ${t("model.route." + i.paybackType.toLowerCase())}`
            }
          />
          {/* TODO: new staking route */}
          <SpacerV />
        </>
      )}

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

export default BuyRouteEdit;
