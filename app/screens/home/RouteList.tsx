import React, { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell, CompactHeader, CompactTitle } from "../../elements/Tables";
import { H2, H3 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { putBuyRoute, putSellRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { updateObject } from "../../utils/Utils";
import Clipboard from "expo-clipboard";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeviceClass } from "../../utils/Device";

interface Props {
  buyRoutes?: BuyRoute[];
  setBuyRoutes: Dispatch<SetStateAction<BuyRoute[] | undefined>>;
  sellRoutes?: SellRoute[];
  setSellRoutes: Dispatch<SetStateAction<SellRoute[] | undefined>>;
  isBuyRouteEdit: boolean;
  setIsBuyRouteEdit: Dispatch<SetStateAction<boolean>>;
  isSellRouteEdit: boolean;
  setIsSellRouteEdit: Dispatch<SetStateAction<boolean>>;
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
      </>
    ) : (
      <IconPlaceholder icon="magnify" />
    )}
  </>
);

const RouteList = ({
  buyRoutes,
  setBuyRoutes,
  sellRoutes,
  setSellRoutes,
  isBuyRouteEdit,
  setIsBuyRouteEdit,
  isSellRouteEdit,
  setIsSellRouteEdit,
}: Props) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [isBuyLoading, setIsBuyLoading] = useState<{ [id: string]: boolean }>({});
  const [isSellLoading, setIsSellLoading] = useState<{ [id: string]: boolean }>({});
  const [detailRoute, setDetailRoute] = useState<SellRoute | BuyRoute | undefined>(undefined);

  const activeBuyRoutes = buyRoutes?.filter((r) => r.active);
  const activeSellRoutes = sellRoutes?.filter((r) => r.active);

  const onBuyRouteCreated = (route: BuyRoute) => {
    setBuyRoutes((routes) => updateRoutes(route, routes));
    setIsBuyRouteEdit(false);
  };
  const onSellRouteCreated = (route: SellRoute) => {
    setSellRoutes((routes) => updateRoutes(route, routes));
    setIsSellRouteEdit(false);
  };
  const updateRoutes: <T extends BuyRoute | SellRoute>(route: T, routes?: T[]) => T[] | undefined = (route, routes) => {
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
    putBuyRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsBuyLoading((obj) => updateObject(obj, { [route.id]: false })));
  };
  const deleteSellRoute = (route: SellRoute) => {
    setIsSellLoading((obj) => updateObject(obj, { [route.id]: true }));
    putSellRoute(updateObject(route, { active: false }))
      .then(() => (route.active = false))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsSellLoading((obj) => updateObject(obj, { [route.id]: false })));
  };

  return (
    <>
      <DeFiModal isVisible={isBuyRouteEdit} setIsVisible={setIsBuyRouteEdit} title={t("model.route.new_buy")}>
        <BuyRouteEdit routes={buyRoutes} onRouteCreated={onBuyRouteCreated} />
      </DeFiModal>
      <DeFiModal isVisible={isSellRouteEdit} setIsVisible={setIsSellRouteEdit} title={t("model.route.new_sell")}>
        <SellRouteEdit routes={sellRoutes} onRouteCreated={onSellRouteCreated} />
      </DeFiModal>
      <DeFiModal
        isVisible={Boolean(detailRoute)}
        setIsVisible={() => setDetailRoute(undefined)}
        title={t("model.route.details")}
        style={{ width: 1000 }}
      >
        {detailRoute && (
          <>
            <DataTable>
              {"asset" in detailRoute ? (
                <CompactRow>
                  <CompactCell style={{ flex: 1 }}>{t("model.route.asset")}</CompactCell>
                  <CompactCell style={{ flex: 2 }}>{detailRoute.asset?.name}</CompactCell>
                </CompactRow>
              ) : (
                <CompactRow>
                  <CompactCell style={{ flex: 1 }}>{t("model.route.fiat")}</CompactCell>
                  <CompactCell style={{ flex: 2 }}>{detailRoute.fiat?.name}</CompactCell>
                </CompactRow>
              )}
              <CompactRow>
                <CompactCell style={{ flex: 1 }}>{t("model.route.iban")}</CompactCell>
                <CompactCell style={{ flex: 2 }}>{detailRoute.iban}</CompactCell>
              </CompactRow>
              {"bankUsage" in detailRoute ? (
                <CompactRow>
                  <CompactCell style={{ flex: 1 }}>{t("model.route.bank_usage")}</CompactCell>
                  <CompactCell style={{ flex: 2 }}>{detailRoute.bankUsage}</CompactCell>
                </CompactRow>
              ) : (
                <CompactRow>
                  <CompactCell style={{ flex: 1 }}>{t("model.route.deposit_address")}</CompactCell>
                  <CompactCell style={{ flex: 2 }}>{detailRoute.deposit?.address}</CompactCell>
                </CompactRow>
              )}
            </DataTable>

            <SpacerV height={20} />

            <View>
              <ButtonContainer>
                <DeFiButton
                  onPress={() =>
                    "asset" in detailRoute
                      ? Clipboard.setString(detailRoute.bankUsage)
                      : Clipboard.setString(detailRoute.deposit?.address)
                  }
                >
                  {t("asset" in detailRoute ? "model.route.copy_bank_usage" : "model.route.copy_deposit_address")}
                </DeFiButton>
                <DeFiButton
                  mode="contained"
                  loading={"asset" in detailRoute ? isBuyLoading[detailRoute.id] : isSellLoading[detailRoute.id]}
                  onPress={() => ("asset" in detailRoute ? deleteBuyRoute(detailRoute) : deleteSellRoute(detailRoute))}
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
              {/* TODO: SonarLink */}
              {/* TODO: reactivate */}
              <DeFiButton mode="contained" onPress={() => setIsSellRouteEdit(true)} disabled={true}>
                {t("model.route.sell")}
              </DeFiButton>
            </View>
          </>
        )}
      </View>

      {/* TODO: details */}

      {(activeBuyRoutes?.length ?? 0) + (activeSellRoutes?.length ?? 0) > 0 ? (
        <>
          {activeBuyRoutes && activeBuyRoutes.length > 0 && (
            <>
              <SpacerV />
              <H3 text={t("model.route.buy")} />

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.asset")}</CompactTitle>
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.iban")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.bank_usage")}</CompactTitle>}
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>

                {activeBuyRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.asset?.name}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.iban}</CompactCell>
                    {device.SM && <CompactCell style={{ flex: 2 }}>{route.bankUsage}</CompactCell>}
                    <CompactCell style={{ flex: undefined }}>
                      {device.SM ? (
                        <>
                          <IconButton icon="content-copy" onPress={() => Clipboard.setString(route.bankUsage)} />
                          <IconButton
                            icon="delete"
                            onPress={() => deleteBuyRoute(route)}
                            isLoading={isBuyLoading[route.id]}
                          />
                        </>
                      ) : (
                        <IconButton icon="magnify" onPress={() => setDetailRoute(route)} />
                      )}
                    </CompactCell>
                  </CompactRow>
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
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.iban")}</CompactTitle>
                  {device.SM && <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>}
                  <CompactTitle style={{ flex: undefined }}>
                    <Placeholders device={device} />
                  </CompactTitle>
                </CompactHeader>

                {activeSellRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.fiat?.name}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.iban}</CompactCell>
                    {device.SM && <CompactCell style={{ flex: 2 }}>{route.deposit?.address}</CompactCell>}
                    <CompactCell style={{ flex: undefined }}>
                      {device.SM ? (
                        <>
                          <IconButton icon="content-copy" onPress={() => Clipboard.setString(route.deposit?.address)} />
                          <IconButton
                            icon="delete"
                            onPress={() => deleteSellRoute(route)}
                            isLoading={isSellLoading[route.id]}
                          />
                        </>
                      ) : (
                        <IconButton icon="magnify" onPress={() => setDetailRoute(route)} />
                      )}
                    </CompactCell>
                  </CompactRow>
                ))}
              </DataTable>
            </>
          )}
        </>
      ) : (
        <Text style={AppStyles.i}>{t("model.route.none")}</Text>
      )}

      <SpacerV height={50} />
      <H3 text={t("model.route.payment_info")} />
      <SpacerV />
      <Text>DE 0212 0300 0000 0020 2088</Text>
      <Text>Bank XY</Text>
      <Text>Fiat 2 DeFi AG</Text>
      <Text>Hodlerstrasse 21</Text>
      <Text>6300 Zug</Text>
    </>
  );
};

export default RouteList;
