import React, { Dispatch, SetStateAction, useState } from "react";
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
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { createHistoryCsv, putBuyRoute, putSellRoute, putStakingRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { openUrl, updateObject } from "../../utils/Utils";
import ClipboardService from "../../services/ClipboardService";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeviceClass } from "../../utils/Device";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Session } from "../../services/AuthService";
import withSession from "../../hocs/withSession";
import Colors from "../../config/Colors";
import { Environment } from "../../env/Environment";
import { ApiError } from "../../models/ApiDto";
import { User } from "../../models/User";
import { StakingRoute, StakingType } from "../../models/StakingRoute";
import StakingRouteEdit from "../../components/edit/StakingRouteEdit";

interface Props {
  user?: User;
  session?: Session;
  buyRoutes?: BuyRoute[];
  setBuyRoutes: Dispatch<SetStateAction<BuyRoute[] | undefined>>;
  sellRoutes?: SellRoute[];
  setSellRoutes: Dispatch<SetStateAction<SellRoute[] | undefined>>;
  stakingRoutes?: StakingRoute[];
  setStakingRoutes: Dispatch<SetStateAction<StakingRoute[] | undefined>>;
  isBuyRouteEdit: boolean;
  setIsBuyRouteEdit: Dispatch<SetStateAction<boolean>>;
  isSellRouteEdit: boolean;
  setIsSellRouteEdit: Dispatch<SetStateAction<boolean>>;
  isStakingRouteEdit: boolean;
  setIsStakingRouteEdit: Dispatch<SetStateAction<boolean>>;
}

const IconPlaceholder = ({ icon }: { icon: string }) => (
  <IconButton icon={icon} style={AppStyles.hidden} disabled={true} />
);
const Placeholders = ({ device }: { device: DeviceClass }) => (
  <>
    {device.SM ? (
      <>
        <IconPlaceholder icon="content-copy" />
        <IconPlaceholder icon="delete" />
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
  session,
  buyRoutes,
  setBuyRoutes,
  sellRoutes,
  setSellRoutes,
  stakingRoutes,
  setStakingRoutes,
  isBuyRouteEdit,
  setIsBuyRouteEdit,
  isSellRouteEdit,
  setIsSellRouteEdit,
  isStakingRouteEdit,
  setIsStakingRouteEdit,
}: Props) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [isBuyLoading, setIsBuyLoading] = useState<{ [id: string]: boolean }>({});
  const [isSellLoading, setIsSellLoading] = useState<{ [id: string]: boolean }>({});
  const [isStakingLoading, setIsStakingLoading] = useState<{ [id: string]: boolean }>({});
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [detailRoute, setDetailRoute] = useState<BuyRoute | SellRoute | StakingRoute | undefined>(undefined);

  const activeBuyRoutes = buyRoutes?.filter((r) => r.active);
  const activeSellRoutes = sellRoutes?.filter((r) => r.active);
  const activeStakingRoutes = stakingRoutes?.filter((r) => r.active);

  const onBuyRouteCreated = (route: BuyRoute) => {
    setBuyRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsBuyRouteEdit(false);
  };
  const onSellRouteCreated = (route: SellRoute) => {
    setSellRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsSellRouteEdit(false);
  };
  const onStakingRouteCreated = (route: StakingRoute) => {
    setStakingRoutes((routes) => updateRoutes(route, routes));
    setDetailRoute(route);
    setIsStakingRouteEdit(false);
  };
  const updateRoutes: <T extends BuyRoute | SellRoute | StakingRoute>(route: T, routes?: T[]) => T[] | undefined = (
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

  const onExportHistory = () => {
    setIsHistoryLoading(true);
    createHistoryCsv()
      .then((fileKey) => openUrl(`${Environment.api.baseUrl}/transaction/csv?key=${fileKey}`))
      .catch((error: ApiError) =>
        NotificationService.error(t(error.statusCode === 404 ? "model.route.no_tx" : "feedback.load_failed"))
      )
      .finally(() => setIsHistoryLoading(false));
  };

  const routeData = (route: BuyRoute | SellRoute | StakingRoute) =>
    "asset" in route // buy route
      ? [
          { condition: true, label: "model.route.asset", value: route.asset?.name },
          { condition: true, label: "model.route.iban", value: route.iban },
          { condition: true, label: "model.route.bank_usage", value: route.bankUsage },
          {
            condition: true,
            label: "model.route.fee",
            value: `${route.fee}%` + (route.refBonus ? ` (${route.refBonus}% ${t("model.route.ref_bonus")})` : ""),
          },
          { condition: true, label: "model.route.volume", value: `${route.volume} €` },
          { condition: true, label: "model.route.annual_volume", value: `${route.annualVolume} €` },
        ]
      : "fiat" in route // sell route
      ? [
          { condition: true, label: "model.route.fiat", value: route.fiat?.name },
          { condition: true, label: "model.route.iban", value: route.iban },
          { condition: true, label: "model.route.deposit_address", value: route.deposit?.address },
          { condition: true, label: "model.route.fee", value: `${route.fee}%` },
          { condition: true, label: "model.route.min_deposit", value: "0.1 DFI" },
        ]
      : // staking route
        [
          { condition: true, label: "model.route.deposit_address", value: route.deposit?.address },
          { condition: true, label: "model.route.min_deposit", value: "0.1 DFI" },
          { condition: true, label: "model.route.min_invest", value: "100 DFI" },
          {
            condition: true,
            label: "model.route.reward",
            value:
              route.rewardType === StakingType.PAYOUT
                ? `${route.rewardSell?.fiat.name} - ${route.rewardSell?.iban}`
                : t(`model.route.${route.rewardType.toLowerCase()}`),
          },
          { condition: true, label: "model.route.fee", value: "0%" },
          { condition: true, label: "model.route.payback_date", value: "31.03.2022" },
          {
            condition: true,
            label: "model.route.payback",
            value:
              route.paybackType === StakingType.PAYOUT
                ? `${route.paybackSell?.fiat.name} - ${route.paybackSell?.iban}`
                : t(`model.route.${route.paybackType.toLowerCase()}`),
          },
          { condition: true, label: "model.route.balance", value: `${route.balance} DFI` },
        ];

  return (
    <>
      <DeFiModal
        isVisible={isBuyRouteEdit}
        setIsVisible={setIsBuyRouteEdit}
        title={t("model.route.new_buy")}
        style={{ width: 400 }}
      >
        <BuyRouteEdit routes={buyRoutes} onRouteCreated={onBuyRouteCreated} session={session} />
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
        isVisible={isStakingRouteEdit}
        setIsVisible={setIsStakingRouteEdit}
        title={t("model.route.new_staking")}
        style={{ width: 400 }}
      >
        <StakingRouteEdit routes={stakingRoutes} onRouteCreated={onStakingRouteCreated} sells={activeSellRoutes} />
      </DeFiModal>
      <DeFiModal
        isVisible={Boolean(detailRoute)}
        setIsVisible={() => setDetailRoute(undefined)}
        title={t("model.route.details")}
        style={{ width: 600 }}
      >
        {detailRoute && (
          <>
            <DataTable>
              {routeData(detailRoute)
                .filter((d) => d.condition)
                .map((data) => (
                  <CompactRow key={data.label}>
                    <CompactCell multiLine style={{ flex: 1 }}>
                      {t(data.label)}
                    </CompactCell>
                    <CompactCell multiLine style={{ flex: 2 }}>
                      {data.value}
                    </CompactCell>
                  </CompactRow>
                ))}
            </DataTable>

            <SpacerV height={20} />

            <View>
              <ButtonContainer>
                <DeFiButton
                  onPress={() =>
                    "asset" in detailRoute
                      ? ClipboardService.copy(detailRoute.bankUsage)
                      : ClipboardService.copy(detailRoute.deposit?.address)
                  }
                >
                  {t("asset" in detailRoute ? "model.route.copy_bank_usage" : "model.route.copy_deposit_address")}
                </DeFiButton>
                <DeFiButton
                  mode="contained"
                  loading={
                    "asset" in detailRoute
                      ? isBuyLoading[detailRoute.id]
                      : "fiat" in detailRoute
                      ? isSellLoading[detailRoute.id]
                      : isStakingLoading[detailRoute.id]
                  }
                  onPress={() => {
                    ("asset" in detailRoute
                      ? deleteBuyRoute(detailRoute)
                      : "fiat" in detailRoute
                      ? deleteSellRoute(detailRoute)
                      : deleteStakingRoute(detailRoute)
                    ).then(() => setDetailRoute(undefined));
                  }}
                  disabled={"isInUse" in detailRoute && detailRoute.isInUse}
                >
                  {t("action.delete")}
                </DeFiButton>
              </ButtonContainer>
            </View>
          </>
        )}
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
            {session?.isBetaUser && (
              <View style={AppStyles.ml10}>
                <DeFiButton mode="contained" onPress={() => setIsStakingRouteEdit(true)}>
                  {t("model.route.staking")}
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
          {session?.isBetaUser && (
            <>
              <SpacerV />
              <View style={AppStyles.containerHorizontal}>
                <DeFiButton mode="contained" onPress={() => setIsStakingRouteEdit(true)} style={{ flex: 1 }}>
                  {t("model.route.staking")}
                </DeFiButton>
              </View>
            </>
          )}
        </>
      )}

      {(activeBuyRoutes?.length ?? 0) + (activeSellRoutes?.length ?? 0) + (activeStakingRoutes?.length ?? 0) > 0 ? (
        <>
          {activeBuyRoutes && activeBuyRoutes.length > 0 && (
            <>
              <SpacerV />
              <H3 text={t("model.route.buy")} />

              <DataTable>
                <CompactHeader>
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
                      <CompactCell style={{ flex: 1 }}>{route.asset?.name}</CompactCell>
                      {device.SM && <CompactCell style={{ flex: 2 }}>{route.iban}</CompactCell>}
                      <CompactCell style={{ flex: 2 }}>{route.bankUsage}</CompactCell>
                      <CompactCell style={{ flex: undefined }}>
                        {device.SM ? (
                          <>
                            <IconButton icon="content-copy" onPress={() => ClipboardService.copy(route.bankUsage)} />
                            <IconButton
                              icon="delete"
                              onPress={() => deleteBuyRoute(route)}
                              isLoading={isBuyLoading[route.id]}
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
                            <IconButton
                              icon="delete"
                              onPress={() => deleteSellRoute(route)}
                              isLoading={isSellLoading[route.id]}
                              disabled={route.isInUse}
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

              <SpacerV />
              <Text style={[AppStyles.b, { color: Colors.Yellow }]}>{t("model.route.dfi_only")}</Text>
            </>
          )}
          {activeStakingRoutes && activeStakingRoutes.length > 0 && (
            <>
              <SpacerV height={20} />
              <H3 text={t("model.route.staking")} />

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
                            <IconButton
                              icon="delete"
                              onPress={() => deleteStakingRoute(route)}
                              isLoading={isStakingLoading[route.id]}
                              disabled={route.isInUse}
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

          {session?.isBetaUser && (
            <>
              <SpacerV height={20} />
              <ButtonContainer>
                <DeFiButton mode="contained" onPress={onExportHistory} loading={isHistoryLoading}>
                  {t("model.route.history")}
                </DeFiButton>
              </ButtonContainer>
            </>
          )}
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
