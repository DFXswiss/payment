import React, { useState } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import Colors from "../../config/Colors";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell, CompactHeader, CompactTitle } from "../../elements/Tables";
import { H2, H3 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { putBuyRoute, putSellRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { update } from "../../utils/Utils";

interface Props {
  user?: User;
  buyRoutes?: BuyRoute[];
  setBuyRoutes: Dispatch<SetStateAction<BuyRoute[] | undefined>>;
  sellRoutes?: SellRoute[];
  setSellRoutes: Dispatch<SetStateAction<SellRoute[] | undefined>>;
  isBuyRouteEdit: boolean;
  setIsBuyRouteEdit: Dispatch<SetStateAction<boolean>>;
  isSellRouteEdit: boolean;
  setIsSellRouteEdit: Dispatch<SetStateAction<boolean>>;
}

const RouteList = ({
  user,
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

  const activeBuyRoutes = buyRoutes?.filter((r) => r.active);
  const activeSellRoutes = sellRoutes?.filter((r) => r.active);

  const onBuyRouteCreated = (route: BuyRoute) => {
    setBuyRoutes((routes) => {
      routes?.push(route);
      return routes;
    });
    setIsBuyRouteEdit(false);
  };
  const onSellRouteCreated = (route: SellRoute) => {
    setSellRoutes((routes) => {
      routes?.push(route);
      return routes;
    });
    setIsSellRouteEdit(false);
  };

  const deleteBuyRoute = (route: BuyRoute) => {
    setIsBuyLoading((obj) => update(obj, { [route.id]: true }));
    route.active = false;
    putBuyRoute(route)
      .then(() => setBuyRoutes((routes) => routes?.filter((r) => r.id !== route.id)))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsBuyLoading((obj) => update(obj, { [route.id]: false })));
  };
  const deleteSellRoute = (route: SellRoute) => {
    setIsSellLoading((obj) => update(obj, { [route.id]: true }));
    route.active = false;
    putSellRoute(route)
      .then(() => setSellRoutes((routes) => routes?.filter((r) => r.id !== route.id)))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsSellLoading((obj) => update(obj, { [route.id]: false })));
  };

  return (
    <>
      <DeFiModal isVisible={isBuyRouteEdit} setIsVisible={setIsBuyRouteEdit} title={t("model.route.new_buy")}>
        <BuyRouteEdit isVisible={isBuyRouteEdit} routes={buyRoutes} onRouteCreated={onBuyRouteCreated} />
      </DeFiModal>
      <DeFiModal isVisible={isSellRouteEdit} setIsVisible={setIsSellRouteEdit} title={t("model.route.new_sell")}>
        <SellRouteEdit isVisible={isSellRouteEdit} routes={sellRoutes} user={user} onRouteCreated={onSellRouteCreated} />
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
          </>
        )}
      </View>

      {/* multiple times same asset with different iban possible (verify) */}
      {/* TODO: verify all: create, delete, reactivate */}
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
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.iban")}</CompactTitle>
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.bank_usage")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <IconButton icon="delete" color={Colors.Primary} style={AppStyles.hidden} disabled={true} />
                  </CompactTitle>
                </CompactHeader>

                {activeBuyRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.asset?.name}</CompactCell>
                    <CompactCell style={{ flex: 1 }}>{route.iban}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.bankUsage}</CompactCell>
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton
                        icon="delete"
                        color={Colors.Primary}
                        onPress={() => deleteBuyRoute(route)}
                        isLoading={isBuyLoading[route.id]}
                      />
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
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.iban")}</CompactTitle>
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <IconButton icon="delete" color={Colors.Primary} style={AppStyles.hidden} disabled={true} />
                  </CompactTitle>
                </CompactHeader>

                {activeSellRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.fiat?.name}</CompactCell>
                    <CompactCell style={{ flex: 1 }}>{route.iban}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.depositId}</CompactCell>
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton
                        icon="delete"
                        color={Colors.Primary}
                        onPress={() => deleteSellRoute(route)}
                        isLoading={isSellLoading[route.id]}
                      />
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
