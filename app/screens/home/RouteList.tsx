import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell, CompactHeader, CompactTitle } from "../../elements/Tables";
import { H2, H3 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { BuyRoute, BuyType } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { getStakingBatches, putBuyRoute, putCryptoRoute, putSellRoute, putStakingRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { formatAmount, updateObject } from "../../utils/Utils";
import ClipboardService from "../../services/ClipboardService";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeviceClass } from "../../utils/Device";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Session } from "../../services/AuthService";
import withSession from "../../hocs/withSession";
import { User, UserDetail } from "../../models/User";
import { StakingRoute, PayoutType } from "../../models/StakingRoute";
import StakingRouteEdit from "../../components/edit/StakingRouteEdit";
import TransactionHistory from "./TransactionHistory";
import { StakingBatch } from "../../models/StakingBatch";
import Moment from "moment";
import Loading from "../../components/util/Loading";
import { CryptoRoute } from "../../models/CryptoRoute";
import CryptoRouteEdit from "../../components/edit/CryptoRouteEdit";

interface Props {
  user?: User;
  setUser: Dispatch<SetStateAction<UserDetail | undefined>>;
  session?: Session;
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

const iban = "CH68 0857 3177 9752 0181 4";
const swift = "MAEBCHZZ";

const RouteList = ({
  user,
  setUser,
  session,
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
  const [detailRoute, setDetailRoute] = useState<BuyRoute | SellRoute | StakingRoute | CryptoRoute | undefined>(undefined);
  const [isBalanceDetail, setIsBalanceDetail] = useState(false);
  const [stakingBatches, setStakingBatches] = useState<StakingBatch[]>();

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
  }
  const updateRoutes: <T extends BuyRoute | SellRoute | StakingRoute | CryptoRoute>(route: T, routes?: T[]) => T[] | undefined = (
    route,
    routes
  ) => {
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
    setIsCryptoLoading((obj) => updateObject(obj, { [route.id]: true }))
    return putCryptoRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsCryptoLoading((obj) => updateObject(obj, { [route.id]: false })));
  }

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

  const routeData = (route: BuyRoute | SellRoute | StakingRoute | CryptoRoute) =>
    "blockchain" in route // crypto route
      ? [
        {
          condition: true,
          label: "model.route.deposit_address",
          value: route.deposit?.address,
          icon: "content-copy",
          onPress: () => ClipboardService.copy(route.deposit?.address),
        },
        { condition: true, label: "model.route.blockchain", value: route.blockchain },
        { condition: true, label: "model.route.asset", value: route.asset?.name },
        { condition: true, label: "model.route.fee", value: `${route.fee}%` },
        { condition: true, label: "model.route.volume", value: `${formatAmount(route.volume)} €` },
        { condition: true, label: "model.route.annual_volume", value: `${formatAmount(route.annualVolume)} €` },
      ]
      : "fiat" in route // sell route
      ? [
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
          { condition: true, label: "model.route.min_deposit", value: "0.1 DFI / 1 USD" },
          { condition: true, label: "model.route.volume", value: `${formatAmount(route.volume)} €` },
        ]
      : "rewardType" in route // staking route
      ? [
          {
            condition: true,
            label: "model.route.deposit_address",
            value: route.deposit?.address,
            icon: "content-copy",
            onPress: () => ClipboardService.copy(route.deposit?.address),
          },
          { condition: true, label: "model.route.min_deposit", value: "0.1 DFI" },
          { condition: true, label: "model.route.min_invest", value: "100 DFI" },
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
        ]
      : // buy route
      [
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
        { condition: true, label: "model.route.volume", value: `${formatAmount(route.volume)} €` },
        { condition: true, label: "model.route.annual_volume", value: `${formatAmount(route.annualVolume)} €` },
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
                  loading={
                    "type" in detailRoute
                      ? isBuyLoading[detailRoute.id]
                      : "fiat" in detailRoute
                      ? isSellLoading[detailRoute.id]
                      : isStakingLoading[detailRoute.id]
                  }
                  onPress={() => {
                    ("blockchain" in detailRoute
                      ? deleteCryptoRoute(cryptoRoutes?.find((r) => r.id === detailRoute.id) as CryptoRoute)
                      : "fiat" in detailRoute
                      ? deleteSellRoute(sellRoutes?.find((r) => r.id === detailRoute.id) as SellRoute)
                      : "rewardType" in detailRoute
                      ? deleteStakingRoute(stakingRoutes?.find((r) => r.id === detailRoute.id) as StakingRoute)
                      : deleteBuyRoute(buyRoutes?.find((r) => r.id === detailRoute.id) as BuyRoute)
                    ).then(() => setDetailRoute(undefined));
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
        setIsVisible={() => setIsBalanceDetail(false)}
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
        <CryptoRouteEdit
          routes={cryptoRoutes}
          onRouteCreated={onCryptoRouteCreated}
        />
      </DeFiModal>

      <DeFiModal
        isVisible={isHistoryVisible}
        setIsVisible={setIsHistoryVisible}
        title={t("model.route.history")}
        style={{ width: 400 }}
      >
        <TransactionHistory
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

      {(activeBuyRoutes?.length ?? 0) + (activeSellRoutes?.length ?? 0) + (activeStakingRoutes?.length ?? 0) + (activeCryptoRoutes?.length ?? 0) > 0 ? (
        <>
          {activeBuyRoutes && activeBuyRoutes.length > 0 && (
            <>
              <SpacerV />
              <H3 text={t("model.route.buy")} />

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
                      <CompactCell style={{ flex: 1 }}>
                        {route.blockchain}
                      </CompactCell>
                      <CompactCell style={{ flex: 1 }}>
                        {route.asset?.name}
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

      {activeBuyRoutes && activeBuyRoutes.length > 0 && (
        <>
          <SpacerV height={50} />
          <H3 text={t("model.route.payment_info")} />
          <SpacerV />
          <Text>DFX AG</Text>
          <Text>Bahnhofstrasse 7</Text>
          <Text>6300 Zug</Text>
          <Text>Schweiz</Text>
          <SpacerV />
          <View style={AppStyles.containerHorizontal}>
            <Text>{`${t("model.route.iban")}: ${iban}`}</Text>
            <IconButton
              icon="content-copy"
              onPress={() => ClipboardService.copy(iban)}
              style={device.SM ? undefined : AppStyles.mla}
              size={20}
            />
          </View>
          <View style={AppStyles.containerHorizontal}>
            <Text>{`SWIFT/BIC: ${swift}`}</Text>
            <IconButton
              icon="content-copy"
              onPress={() => ClipboardService.copy(swift)}
              style={device.SM ? undefined : AppStyles.mla}
              size={20}
            />
          </View>
        </>
      )}
    </>
  );
};

export default withSession(RouteList);
