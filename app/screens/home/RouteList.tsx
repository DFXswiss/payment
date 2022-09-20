import React, { Dispatch, ReactElement, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import { DeFiButton } from "../../elements/Buttons";
import { Spacer, SpacerH, SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell, CompactHeader, CompactTitle } from "../../elements/Tables";
import { H2, H3, H4 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { BuyRoute, BuyType } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import {
  getBuyRouteHistory,
  getCryptoRouteHistory,
  getSellRouteHistory,
  getStakingBatches,
  putBuyRoute,
  putCryptoRoute,
  putSellRoute,
  putStakingRoute,
} from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { formatAmount, updateObject } from "../../utils/Utils";
import ClipboardService from "../../services/ClipboardService";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeviceClass } from "../../utils/Device";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Session } from "../../services/AuthService";
import withSession from "../../hocs/withSession";
import { User, UserDetail, VolumeInformation } from "../../models/User";
import { StakingRoute, PayoutType } from "../../models/StakingRoute";
import StakingRouteEdit from "../../components/edit/StakingRouteEdit";
import TransactionHistory from "./TransactionHistory";
import { StakingBatch } from "../../models/StakingBatch";
import Moment from "moment";
import Loading from "../../components/util/Loading";
import { CryptoRoute } from "../../models/CryptoRoute";
import CryptoRouteEdit from "../../components/edit/CryptoRouteEdit";
import Colors from "../../config/Colors";
import RouteHistory from "../../components/RouteHistory";
import { RouteHistoryAlias } from "../../models/RouteHistory";
import { MinDeposit } from "../../models/MinDeposit";
import { Statistic } from "../../models/Statistic";

interface Props {
  user?: UserDetail;
  setUser: Dispatch<SetStateAction<UserDetail | undefined>>;
  session?: Session;
  statistic?: Statistic;
  buyRoutes?: BuyRoute[];
  setBuyRoutes: Dispatch<SetStateAction<BuyRoute[] | undefined>>;
  sellRoutes?: SellRoute[];
  setSellRoutes: Dispatch<SetStateAction<SellRoute[] | undefined>>;
  stakingRoutes?: StakingRoute[];
  setStakingRoutes: Dispatch<SetStateAction<StakingRoute[] | undefined>>;
  cryptoRoutes?: CryptoRoute[];
  setCryptoRoutes: Dispatch<SetStateAction<CryptoRoute[] | undefined>>;
  isBuyRouteEdit: boolean;
  setIsBuyRouteEdit: Dispatch<SetStateAction<boolean>>;
  isSellRouteEdit: boolean;
  setIsSellRouteEdit: Dispatch<SetStateAction<boolean>>;
  isStakingRouteEdit: boolean;
  setIsStakingRouteEdit: Dispatch<SetStateAction<boolean>>;
  isCryptoRouteEdit: boolean;
  setIsCryptoRouteEdit: Dispatch<SetStateAction<boolean>>;
}

const IconPlaceholder = ({ icon }: { icon: string }) => (
  <IconButton icon={icon} style={AppStyles.hidden} disabled={true} />
);
const Placeholders = ({ device }: { device: DeviceClass }) => (
  <>
    {device.SM ? (
      <>
        <IconPlaceholder icon="content-copy" />
        <IconPlaceholder icon="chevron-right" />
      </>
    ) : (
      <IconPlaceholder icon="chevron-right" />
    )}
  </>
);

type RouteAlias = BuyRoute | SellRoute | StakingRoute | CryptoRoute;

const RouteList = ({
  user,
  setUser,
  session,
  statistic,
  buyRoutes,
  setBuyRoutes,
  sellRoutes,
  setSellRoutes,
  stakingRoutes,
  setStakingRoutes,
  cryptoRoutes,
  setCryptoRoutes,
  isBuyRouteEdit,
  setIsBuyRouteEdit,
  isSellRouteEdit,
  setIsSellRouteEdit,
  isStakingRouteEdit,
  setIsStakingRouteEdit,
  isCryptoRouteEdit,
  setIsCryptoRouteEdit,
}: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const newSellRouteCreated = useRef<(route: SellRoute) => {}>();

  const [isBuyLoading, setIsBuyLoading] = useState<{ [id: string]: boolean }>({});
  const [isSellLoading, setIsSellLoading] = useState<{ [id: string]: boolean }>({});
  const [isStakingLoading, setIsStakingLoading] = useState<{ [id: string]: boolean }>({});
  const [isCryptoLoading, setIsCryptoLoading] = useState<{ [id: string]: boolean }>({});
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [detailRoute, setDetailRoute] = useState<RouteAlias>();
  const [isBalanceDetail, setIsBalanceDetail] = useState(false);
  const [stakingBatches, setStakingBatches] = useState<StakingBatch[]>();
  const [routeHistory, setRouteHistory] = useState<RouteHistoryAlias[]>();
  const [isRouteHistoryVisible, setIsRouteHistoryVisible] = useState(false);

  const activeBuyRoutes = buyRoutes?.filter((r) => r.active);
  const activeSellRoutes = sellRoutes?.filter((r) => r.active);
  const activeStakingRoutes = stakingRoutes?.filter((r) => r.active);
  const activeCryptoRoutes = cryptoRoutes?.filter((r) => r.active);

  const onBuyRouteCreated = (route: BuyRoute) => {
    setBuyRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsBuyRouteEdit(false);
  };
  const onSellRouteCreated = (route: SellRoute) => {
    setSellRoutes((routes) => updateRoutes(route, routes));
    setIsSellRouteEdit(false);
    if (isStakingRouteEdit && newSellRouteCreated?.current) {
      newSellRouteCreated.current(route);
    } else {
      setDetailRoute(route);
    }
  };
  const onStakingRouteCreated = (route: StakingRoute) => {
    setStakingRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsStakingRouteEdit(false);
  };
  const onCryptoRouteCreated = (route: CryptoRoute) => {
    setCryptoRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsCryptoRouteEdit(false);
  };
  const updateRoutes: <T extends RouteAlias>(route: T, routes?: T[]) => T[] | undefined = (route, routes) => {
    const oldRoute = routes?.find((r) => r.id === route.id);
    if (oldRoute) {
      Object.assign(oldRoute, route);
    } else {
      routes?.push(route);
    }
    return routes;
  };

  const deleteBuyRoute = (route: BuyRoute) => {
    setIsBuyLoading((obj) => updateObject(obj, { [route.id]: true }));
    return putBuyRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsBuyLoading((obj) => updateObject(obj, { [route.id]: false })));
  };
  const deleteSellRoute = (route: SellRoute) => {
    setIsSellLoading((obj) => updateObject(obj, { [route.id]: true }));
    return putSellRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsSellLoading((obj) => updateObject(obj, { [route.id]: false })));
  };
  const deleteStakingRoute = (route: StakingRoute) => {
    setIsStakingLoading((obj) => updateObject(obj, { [route.id]: true }));
    return putStakingRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsStakingLoading((obj) => updateObject(obj, { [route.id]: false })));
  };
  const deleteCryptoRoute = (route: CryptoRoute) => {
    setIsCryptoLoading((obj) => updateObject(obj, { [route.id]: true }));
    return putCryptoRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsCryptoLoading((obj) => updateObject(obj, { [route.id]: false })));
  };

  const fetchHistory = (route: BuyRoute | SellRoute | CryptoRoute) => {
    setRouteHistory(undefined);
    setIsRouteHistoryVisible(true);

    let promise: Promise<RouteHistoryAlias[]>;

    if ("blockchain" in route) promise = getCryptoRouteHistory(route);
    else if ("fiat" in route) promise = getSellRouteHistory(route);
    else promise = getBuyRouteHistory(route);

    promise.then(setRouteHistory).catch(() => {
      setIsRouteHistoryVisible(false);
      NotificationService.error(t("feedback.load_failed"));
    });
  };

  const fetchStakingBatches = (route: StakingRoute) => {
    setStakingBatches(undefined);
    setIsBalanceDetail(true);
    getStakingBatches(route)
      .then(setStakingBatches)
      .catch(() => {
        setIsBalanceDetail(false);
        NotificationService.error(t("feedback.load_failed"));
      });
  };

  const formatMinDeposit = (minDeposits: MinDeposit[]): string => {
    return minDeposits.map((d) => `${d.amount} ${d.asset}`).join(" / ");
  };

  const cryptoRouteData = (route: CryptoRoute) => [
    {
      condition: true,
      label: "model.route.deposit_address",
      value: route.deposit?.address,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(route.deposit?.address),
    },
    { condition: true, label: "model.route.blockchain", value: route.blockchain },
    { condition: true, label: "model.route.asset", value: route.asset?.name },
    {
      condition: true,
      label: "model.route.fee",
      value: `${route.fee}%` + (route.refBonus ? ` (${route.refBonus}% ${t("model.route.ref_bonus")})` : ""),
    },
    {
      condition: true,
      label: "model.route.min_deposit",
      value: `${formatMinDeposit(route.minDeposits)}`,
    },
    {
      condition: true,
      label: "model.route.volume",
      value: `${formatAmount(route.volume)} €`,
      icon: route.volume > 0 ? "chevron-right" : undefined,
      onPress: () => fetchHistory(route),
    },
    { condition: true, label: "model.route.annual_volume", value: `${formatAmount(route.annualVolume)} €` },
  ];

  const sellRouteData = (route: SellRoute) => [
    { condition: true, label: "model.route.fiat", value: route.fiat?.name },
    { condition: true, label: "model.route.iban", value: route.iban },
    {
      condition: true,
      label: "model.route.deposit_address",
      value: route.deposit?.address,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(route.deposit?.address),
    },
    { condition: true, label: "model.route.fee", value: `${route.fee}%` },
    {
      condition: true,
      label: "model.route.min_deposit",
      value: `${formatMinDeposit(route.minDeposits)}`,
    },
    {
      condition: true,
      label: "model.route.volume",
      value: `${formatAmount(route.volume)} €`,
      icon: route.volume > 0 ? "chevron-right" : undefined,
      onPress: () => fetchHistory(route),
    },
  ];

  const stakingRouteData = (route: StakingRoute) => [
    {
      condition: true,
      label: "model.route.deposit_address",
      value: route.deposit?.address,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(route.deposit?.address),
    },
    { condition: true, label: "model.route.min_deposit", value: `${formatMinDeposit(route.minDeposits)}` },
    { condition: true, label: "model.route.min_invest", value: `${route.minInvestment} DFI` },
    {
      condition: true,
      label: "model.route.reward",
      value:
        route.rewardType === PayoutType.BANK_ACCOUNT
          ? `${route.rewardSell?.fiat.name} - ${route.rewardSell?.iban}`
          : t(`model.route.${route.rewardType.toLowerCase()}`),
    },
    {
      condition: route.rewardType === PayoutType.WALLET,
      label: "model.route.reward_asset",
      value: route.rewardAsset?.name,
    },
    { condition: true, label: "model.route.reward_fee", value: `${route.fee}%` },
    { condition: true, label: "model.route.payback_date", value: `${route.period} ${t("model.route.days")}` },
    {
      condition: true,
      label: "model.route.payback",
      value:
        route.paybackType === PayoutType.BANK_ACCOUNT
          ? `${route.paybackSell?.fiat.name} - ${route.paybackSell?.iban}`
          : t(`model.route.${route.paybackType.toLowerCase()}`),
    },
    {
      condition: route.paybackType === PayoutType.WALLET,
      label: "model.route.payback_asset",
      value: route.paybackAsset?.name,
    },
    {
      condition: true,
      label: "model.route.balance",
      value: `${formatAmount(route.balance)} DFI`,
      icon: route.balance > 0 ? "chevron-right" : undefined,
      onPress: () => fetchStakingBatches(route),
    },
    { condition: true, label: "model.route.rewards", value: `${formatAmount(route.rewardVolume)} EUR` },
  ];

  const buyRouteData = (route: BuyRoute) => [
    { condition: true, label: "model.route.type", value: t(`model.route.${route.type.toLowerCase()}`) },
    { condition: route.type === BuyType.WALLET, label: "model.route.asset", value: route.asset?.name },
    {
      condition: route.type === BuyType.STAKING,
      label: "model.route.staking",
      value: `${t("model.route." + route.staking?.rewardType.toLowerCase())} - ${t(
        "model.route." + route.staking?.paybackType.toLowerCase()
      )}`,
    },
    { condition: true, label: "model.route.iban", value: route.iban },
    {
      condition: true,
      label: "model.route.bank_usage",
      value: route.bankUsage,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(route.bankUsage),
    },
    {
      condition: true,
      label: "model.route.fee",
      value: `${route.fee}%` + (route.refBonus ? ` (${route.refBonus}% ${t("model.route.ref_bonus")})` : ""),
    },
    { condition: true, label: "model.route.min_deposit", value: `${formatMinDeposit(route.minDeposits)}` },
    {
      condition: true,
      label: "model.route.volume",
      value: `${formatAmount(route.volume)} €`,
      icon: route.volume > 0 ? "chevron-right" : undefined,
      onPress: () => fetchHistory(route),
    },
    { condition: true, label: "model.route.annual_volume", value: `${formatAmount(route.annualVolume)} €` },
  ];

  const routeData = (route: RouteAlias) => {
    if ("blockchain" in route) return cryptoRouteData(route);
    else if ("fiat" in route) return sellRouteData(route);
    else if ("rewardType" in route) return stakingRouteData(route);
    else return buyRouteData(route);
  };

  const deleteRoute = (route: RouteAlias): Promise<boolean | void> => {
    if ("blockchain" in route) return deleteCryptoRoute(cryptoRoutes?.find((r) => r.id === route.id) as CryptoRoute);
    else if ("fiat" in route) return deleteSellRoute(sellRoutes?.find((r) => r.id === route.id) as SellRoute);
    else if ("rewardType" in route)
      return deleteStakingRoute(stakingRoutes?.find((r) => r.id === route.id) as StakingRoute);
    else return deleteBuyRoute(buyRoutes?.find((r) => r.id === route.id) as BuyRoute);
  };

  const isRouteLoading = (route: RouteAlias): boolean => {
    if ("blockchain" in route) return isCryptoLoading[route.id];
    else if ("fiat" in route) return isSellLoading[route.id];
    else if ("rewardType" in route) return isStakingLoading[route.id];
    else return isBuyLoading[route.id];
  };

  const volumeInfoData = (info?: VolumeInformation) => [
    { label: t("model.route.total_volume"), value: `${formatAmount(info?.total)} €` },
    { label: t("model.route.annual_volume"), value: `${formatAmount(info?.annual)} €` },
  ];

  const stakingInfoData = (balance?: number, statistic?: Statistic) => [
    { label: t("model.route.balance"), value: `${formatAmount(balance)} DFI` },
    { label: "APR", value: `${((statistic?.staking.yield.apr ?? 0) * 100).toFixed(1)}%` },
    { label: "APY", value: `${((statistic?.staking.yield.apy ?? 0) * 100).toFixed(1)}%` },
  ];

  return (
    <>
      <DeFiModal
        isVisible={Boolean(detailRoute)}
        setIsVisible={(visible) => (visible ? undefined : setDetailRoute(undefined))}
        title={t("model.route.details")}
        style={{ width: 600 }}
      >
        {detailRoute && (
          <>
            <DataTable>
              {routeData(detailRoute)
                .filter((d) => d.condition)
                .map((d) => (
                  <TouchableOpacity onPress={d.onPress} key={d.label} disabled={!d.icon || device.SM}>
                    <CompactRow>
                      <CompactCell multiLine style={{ flex: 1 }}>
                        {t(d.label)}
                      </CompactCell>
                      <View style={{ flex: device.SM ? 2 : 1, flexDirection: "row" }}>
                        <CompactCell multiLine>{d.value}</CompactCell>
                        {d.icon && (
                          <CompactCell style={{ flex: undefined }}>
                            <IconButton icon={d.icon} onPress={device.SM ? d.onPress : undefined} />
                          </CompactCell>
                        )}
                      </View>
                    </CompactRow>
                  </TouchableOpacity>
                ))}
            </DataTable>

            <SpacerV height={20} />

            <View>
              <ButtonContainer>
                <DeFiButton
                  loading={isRouteLoading(detailRoute)}
                  onPress={() => {
                    deleteRoute(detailRoute).then(() => setDetailRoute(undefined));
                  }}
                  disabled={"isInUse" in detailRoute && detailRoute.isInUse}
                >
                  {t("action.delete")}
                </DeFiButton>
                {"rewardType" in detailRoute && (
                  <DeFiButton mode="contained" onPress={() => setIsStakingRouteEdit(true)}>
                    {t("action.edit")}
                  </DeFiButton>
                )}
              </ButtonContainer>
            </View>
          </>
        )}
      </DeFiModal>

      <DeFiModal
        isVisible={isBalanceDetail}
        setIsVisible={setIsBalanceDetail}
        title={t("model.route.balance_details")}
        style={{ width: 450 }}
      >
        {stakingBatches != null ? (
          <DataTable>
            <CompactHeader>
              <CompactTitle style={{ flex: 1 }}>{t("model.route.output_date")}</CompactTitle>
              <CompactTitle style={{ flex: 1 }}>{t("model.route.payback")}</CompactTitle>
              <CompactTitle style={{ flex: 1, justifyContent: "flex-end" }}>{t("model.route.amount")}</CompactTitle>
            </CompactHeader>
            {stakingBatches?.map((batch, i) => (
              <CompactRow key={i}>
                <CompactCell style={{ flex: 1 }}>{Moment(batch.outputDate).format("L")}</CompactCell>
                <CompactCell style={{ flex: 1 }}>{t(`model.route.${batch.payoutType.toLowerCase()}`)}</CompactCell>
                <CompactCell style={{ flex: 1, justifyContent: "flex-end" }}>
                  {`${formatAmount(batch.amount)} DFI`}
                </CompactCell>
              </CompactRow>
            ))}
          </DataTable>
        ) : (
          <Loading size="large" />
        )}
      </DeFiModal>

      <DeFiModal
        isVisible={isStakingRouteEdit}
        setIsVisible={setIsStakingRouteEdit}
        title={t(detailRoute ? "model.route.edit_staking" : "model.route.new_staking")}
        style={{ width: 400 }}
      >
        <StakingRouteEdit
          route={detailRoute as StakingRoute}
          routes={stakingRoutes}
          onRouteCreated={onStakingRouteCreated}
          sells={activeSellRoutes}
          createSellRoute={() => setIsSellRouteEdit(true)}
          newSellRouteCreated={newSellRouteCreated}
        />
      </DeFiModal>
      <DeFiModal
        isVisible={isSellRouteEdit}
        setIsVisible={setIsSellRouteEdit}
        title={t("model.route.new_sell")}
        style={{ width: 400 }}
      >
        <SellRouteEdit routes={sellRoutes} onRouteCreated={onSellRouteCreated} />
      </DeFiModal>
      <DeFiModal
        isVisible={isBuyRouteEdit}
        setIsVisible={setIsBuyRouteEdit}
        title={t("model.route.new_buy")}
        style={{ width: 400 }}
      >
        <BuyRouteEdit
          routes={buyRoutes}
          onRouteCreated={onBuyRouteCreated}
          session={session}
          stakingRoutes={activeStakingRoutes}
        />
      </DeFiModal>
      <DeFiModal
        isVisible={isCryptoRouteEdit}
        setIsVisible={setIsCryptoRouteEdit}
        title={t("model.route.new_crypto")}
        style={{ width: 400 }}
        isBeta={true}
      >
        <CryptoRouteEdit routes={cryptoRoutes} onRouteCreated={onCryptoRouteCreated} />
      </DeFiModal>

      <DeFiModal
        isVisible={isRouteHistoryVisible}
        setIsVisible={setIsRouteHistoryVisible}
        title={t("model.route.history")}
        style={{ width: 700 }}
      >
        {routeHistory != null ? <RouteHistory history={routeHistory} /> : <Loading size="large" />}
      </DeFiModal>

      <DeFiModal
        isVisible={isHistoryVisible}
        setIsVisible={setIsHistoryVisible}
        title={t("model.route.history")}
        style={{ width: 400 }}
      >
        <TransactionHistory
          ctFilter={user?.apiFilterCT}
          onCtFilterChange={(filter) =>
            setUser((user) => {
              user ? (user.apiFilterCT = filter) : undefined;
              return user;
            })
          }
          onClose={() => setIsHistoryVisible(false)}
          apiKey={user?.apiKeyCT}
          setApiKey={(key) => setUser((u) => ({ ...u, apiKeyCT: key } as UserDetail))}
        />
      </DeFiModal>

      <View style={AppStyles.containerHorizontal}>
        <H2 text={t("model.route.routes")} />
        {device.SM && (
          <>
            <Text style={AppStyles.mla}>{t("model.route.new")}</Text>
            <View style={AppStyles.ml10}>
              <DeFiButton mode="contained" onPress={() => setIsBuyRouteEdit(true)}>
                {t("model.route.buy")}
              </DeFiButton>
            </View>
            <View style={AppStyles.ml10}>
              <DeFiButton mode="contained" onPress={() => setIsSellRouteEdit(true)}>
                {t("model.route.sell")}
              </DeFiButton>
            </View>
            <View style={AppStyles.ml10}>
              <DeFiButton mode="contained" onPress={() => setIsStakingRouteEdit(true)}>
                {t("model.route.staking")}
              </DeFiButton>
            </View>
            {session?.isBetaUser && (
              <View style={AppStyles.ml10}>
                <DeFiButton mode="contained" onPress={() => setIsCryptoRouteEdit(true)}>
                  {t("model.route.crypto")}
                </DeFiButton>
              </View>
            )}
          </>
        )}
      </View>

      {!device.SM && (
        <>
          <SpacerV />
          <View style={AppStyles.containerHorizontal}>
            <DeFiButton mode="contained" onPress={() => setIsBuyRouteEdit(true)} style={{ flex: 1 }}>
              {t("model.route.buy")}
            </DeFiButton>
            <SpacerH />
            <DeFiButton mode="contained" onPress={() => setIsSellRouteEdit(true)} style={{ flex: 1 }}>
              {t("model.route.sell")}
            </DeFiButton>
          </View>
          <SpacerV />
          <View style={AppStyles.containerHorizontal}>
            <DeFiButton mode="contained" onPress={() => setIsStakingRouteEdit(true)} style={{ flex: 1 }}>
              {t("model.route.staking")}
            </DeFiButton>
            {session?.isBetaUser && (
              <>
                <SpacerH />
                <DeFiButton mode="contained" onPress={() => setIsCryptoRouteEdit(true)} style={{ flex: 1 }}>
                  {t("model.route.crypto")}
                </DeFiButton>
              </>
            )}
          </View>
        </>
      )}

      {(activeBuyRoutes?.length ?? 0) +
        (activeSellRoutes?.length ?? 0) +
        (activeStakingRoutes?.length ?? 0) +
        (activeCryptoRoutes?.length ?? 0) >
      0 ? (
        <>
          {activeBuyRoutes && activeBuyRoutes.length > 0 && (
            <>
              <SpacerV />
              <H3 text={t("model.route.buy")} />

              {(user?.buyVolume.total ?? 0) > 0 && <InfoTable data={volumeInfoData(user?.buyVolume)} />}

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.type")}</CompactTitle>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.asset")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.iban")}</CompactTitle>}
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.bank_usage")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>

                {activeBuyRoutes.map((route) => (
                  <TouchableOpacity key={route.id} onPress={() => setDetailRoute(route)} disabled={device.SM}>
                    <CompactRow>
                      <CompactCell style={{ flex: 1 }}>{t(`model.route.${route.type.toLowerCase()}`)}</CompactCell>
                      <CompactCell style={{ flex: 1 }}>
                        {route.type === BuyType.WALLET && route.asset?.name}
                      </CompactCell>
                      {device.SM && <CompactCell style={{ flex: 2 }}>{route.iban}</CompactCell>}
                      <CompactCell style={{ flex: 2 }}>{route.bankUsage}</CompactCell>
                      <CompactCell style={{ flex: undefined }}>
                        {device.SM ? (
                          <>
                            <IconButton icon="content-copy" onPress={() => ClipboardService.copy(route.bankUsage)} />
                            <IconButton icon="chevron-right" onPress={() => setDetailRoute(route)} />
                          </>
                        ) : (
                          <IconButton icon="chevron-right" />
                        )}
                      </CompactCell>
                    </CompactRow>
                  </TouchableOpacity>
                ))}
              </DataTable>
            </>
          )}
          {activeSellRoutes && activeSellRoutes.length > 0 && (
            <>
              <SpacerV height={20} />
              <H3 text={t("model.route.sell")} />

              {(user?.sellVolume.total ?? 0) > 0 && <InfoTable data={volumeInfoData(user?.sellVolume)} />}

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.fiat")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.iban")}</CompactTitle>}
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>

                {activeSellRoutes.map((route) => (
                  <TouchableOpacity key={route.id} onPress={() => setDetailRoute(route)} disabled={device.SM}>
                    <CompactRow>
                      <CompactCell style={{ flex: 1 }}>{route.fiat?.name}</CompactCell>
                      {device.SM && <CompactCell style={{ flex: 2 }}>{route.iban}</CompactCell>}
                      <CompactCell style={{ flex: 2 }}>{route.deposit?.address}</CompactCell>
                      <CompactCell style={{ flex: undefined }}>
                        {device.SM ? (
                          <>
                            <IconButton
                              icon="content-copy"
                              onPress={() => ClipboardService.copy(route.deposit?.address)}
                            />
                            <IconButton icon="chevron-right" onPress={() => setDetailRoute(route)} />
                          </>
                        ) : (
                          <IconButton icon="chevron-right" />
                        )}
                      </CompactCell>
                    </CompactRow>
                  </TouchableOpacity>
                ))}
              </DataTable>
            </>
          )}
          {activeStakingRoutes && activeStakingRoutes.length > 0 && (
            <>
              <SpacerV height={20} />
              <View style={AppStyles.containerHorizontal}>
                <H3 text={t("model.route.staking")} />
              </View>

              {(user?.buyVolume.total ?? 0) > 0 && (
                <InfoTable data={stakingInfoData(user?.stakingBalance, statistic)} />
              )}

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.reward")}</CompactTitle>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.payback")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>}
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>

                {activeStakingRoutes.map((route) => (
                  <TouchableOpacity key={route.id} onPress={() => setDetailRoute(route)} disabled={device.SM}>
                    <CompactRow>
                      <CompactCell style={{ flex: 1 }}>
                        {t(`model.route.${route.rewardType.toLowerCase()}`)}
                      </CompactCell>
                      <CompactCell style={{ flex: 1 }}>
                        {t(`model.route.${route.paybackType.toLowerCase()}`)}
                      </CompactCell>
                      {device.SM && <CompactCell style={{ flex: 2 }}>{route.deposit?.address}</CompactCell>}
                      <CompactCell style={{ flex: undefined }}>
                        {device.SM ? (
                          <>
                            <IconButton
                              icon="content-copy"
                              onPress={() => ClipboardService.copy(route.deposit?.address)}
                            />
                            <IconButton icon="chevron-right" onPress={() => setDetailRoute(route)} />
                          </>
                        ) : (
                          <IconButton icon="chevron-right" />
                        )}
                      </CompactCell>
                    </CompactRow>
                  </TouchableOpacity>
                ))}
              </DataTable>
            </>
          )}
          {activeCryptoRoutes && activeCryptoRoutes.length > 0 && (
            <>
              <SpacerV height={20} />
              <View style={AppStyles.containerHorizontal}>
                <H3 text={t("model.route.crypto")} />
                <View style={AppStyles.betaContainer}>
                  <Text style={AppStyles.beta}> Beta</Text>
                </View>
              </View>

              {(user?.cryptoVolume.total ?? 0) > 0 && <InfoTable data={volumeInfoData(user?.cryptoVolume)} />}

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.blockchain")}</CompactTitle>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.asset")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>}
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>
                {activeCryptoRoutes.map((route) => (
                  <TouchableOpacity key={route.id} onPress={() => setDetailRoute(route)} disabled={device.SM}>
                    <CompactRow>
                      <CompactCell style={{ flex: 1 }}>{route.blockchain}</CompactCell>
                      <CompactCell style={{ flex: 1 }}>{route.asset?.name}</CompactCell>
                      {device.SM && <CompactCell style={{ flex: 2 }}>{route.deposit?.address}</CompactCell>}
                      <CompactCell style={{ flex: undefined }}>
                        {device.SM ? (
                          <>
                            <IconButton
                              icon="content-copy"
                              onPress={() => ClipboardService.copy(route.deposit?.address)}
                            />
                            <IconButton icon="chevron-right" onPress={() => setDetailRoute(route)} />
                          </>
                        ) : (
                          <IconButton icon="chevron-right" />
                        )}
                      </CompactCell>
                    </CompactRow>
                  </TouchableOpacity>
                ))}
              </DataTable>
            </>
          )}

          {
            <>
              <SpacerV height={20} />
              <ButtonContainer>
                <DeFiButton mode="contained" onPress={() => setIsHistoryVisible(true)}>
                  {t("model.route.history")}
                </DeFiButton>
              </ButtonContainer>
            </>
          }
        </>
      ) : (
        <>
          <SpacerV />
          <Text style={AppStyles.i}>{t("model.route.none")}</Text>
        </>
      )}

      {activeBuyRoutes && activeBuyRoutes.length > 0 && <PaymentDetails />}
    </>
  );
};

const PaymentDetails = (): ReactElement => {
  const instantIban = "LU11 6060 0020 0000 5040";
  const instantBic = "OLKILUL1";
  const iban = "CH68 0857 3177 9752 0181 4";
  const swift = "MAEBCHZZ";

  const instantItemsLength = 7;
  const itemHasPadding = (i: number) => i > 3;

  const device = useDevice();
  const { t } = useTranslation();

  return (
    <>
      <SpacerV height={50} />
      <H3 text={t("model.route.payment_info")} />
      <SpacerV />
      <Text>DFX AG</Text>
      <Text>Bahnhofstrasse 7</Text>
      <Text>6300 Zug</Text>
      <Text>Schweiz</Text>

      <SpacerV height={20} />

      <View style={device.SM && [AppStyles.containerHorizontal, styles.sepaContainer]}>
        <View style={[styles.sepaItem, device.SM && { flexShrink: 1 }]}>
          <H4 text={t("model.sepa.instant.title")} style={{ color: Colors.Primary }} />
          <CopyLine text={`${t("model.route.iban")}: ${instantIban}`} copyText={instantIban} />
          <CopyLine text={`BIC: ${instantBic}`} copyText={instantBic} />
          <SpacerV />
          {[...Array(instantItemsLength).keys()].map((_, i) => (
            <View
              key={i}
              style={[
                AppStyles.containerHorizontal,
                { alignItems: "flex-start" },
                itemHasPadding(i) && { marginLeft: 20 },
              ]}
            >
              <View>
                <Text>-</Text>
              </View>
              <View style={{ marginLeft: 5, flexShrink: 1 }}>
                <Text>{t(`model.sepa.instant.items.${i}`)}</Text>
              </View>
            </View>
          ))}
        </View>

        <Spacer />

        <View style={[styles.sepaItem, device.SM && { flexShrink: 1 }]}>
          <H4 text={t("model.sepa.regular")} style={{ color: Colors.Primary }} />
          <CopyLine text={`${t("model.route.iban")}: ${iban}`} copyText={iban} />
          <CopyLine text={`SWIFT/BIC: ${swift}`} copyText={swift} />
        </View>
      </View>
    </>
  );
};

type InfoData = { label: string; value: string };
const InfoTable = ({ data }: { data?: InfoData[] }): ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <SpacerV />
      <DataTable>
        <CompactHeader>
          <CompactTitle>{t("model.route.statistics")}</CompactTitle>
        </CompactHeader>
        {data?.map((entry) => {
          return (
            <CompactRow key={entry.label}>
              <CompactCell>{entry.label}</CompactCell>
              <CompactCell>{entry.value}</CompactCell>
            </CompactRow>
          );
        })}
      </DataTable>
      <SpacerV />
    </>
  );
};

const CopyLine = ({ text, copyText }: { text: string; copyText: string }): ReactElement => {
  const device = useDevice();
  return (
    <View style={AppStyles.containerHorizontal}>
      <Text>{text}</Text>
      <IconButton
        icon="content-copy"
        onPress={() => ClipboardService.copy(copyText)}
        style={device.SM ? undefined : AppStyles.mla}
        size={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sepaContainer: {
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sepaItem: {
    flexGrow: 1,
    backgroundColor: Colors.LightBlue,
    padding: 10,
  },
});

export default withSession(RouteList);
