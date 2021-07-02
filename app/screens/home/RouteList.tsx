import React, { useState } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View, Button } from "react-native";
import { Icon } from "react-native-elements";
import { DataTable, Text } from "react-native-paper";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import Colors from "../../config/Colors";
import { SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell, CompactHeader, CompactTitle } from "../../elements/Tables";
import { H2, H3 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { BuyRoute } from "../../models/BuyRoute";
import { PaymentRoutes } from "../../models/PaymentRoutes";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { putBuyRoute, putSellRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import AppStyles from "../../styles/AppStyles";
import { update } from "../../utils/Utils";

interface Props {
  user?: User;
  routes?: PaymentRoutes;
  setRoutes: Dispatch<SetStateAction<PaymentRoutes | undefined>>;
  isBuyRouteEdit: boolean;
  setIsBuyRouteEdit: Dispatch<SetStateAction<boolean>>;
  isSellRouteEdit: boolean;
  setIsSellRouteEdit: Dispatch<SetStateAction<boolean>>;
}

const RouteList = ({
  user,
  routes,
  setRoutes,
  isBuyRouteEdit,
  setIsBuyRouteEdit,
  isSellRouteEdit,
  setIsSellRouteEdit,
}: Props) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [isBuyLoading, setIsBuyLoading] = useState<{ [id: string]: boolean }>({});
  const [isSellLoading, setIsSellLoading] = useState<{ [id: string]: boolean }>({});

  const onBuyRouteChanged = (route: BuyRoute) => {
    setRoutes((routes) => {
      routes?.buyRoutes.push(route);
      return routes ? { ...routes } : undefined;
    });
    setIsBuyRouteEdit(false);
  };
  const onSellRouteChanged = (route: SellRoute) => {
    setRoutes((routes) => {
      routes?.sellRoutes.push(route);
      return routes ? { ...routes } : undefined;
    });
    setIsSellRouteEdit(false);
  };

  const deleteBuyRoute = (route: BuyRoute) => {
    setIsBuyLoading((obj) => update(obj, { [route.id]: true }));
    route.active = false;
    putBuyRoute(route)
      .then(() => setRoutes((routes) => update(routes, {buyRoutes: routes?.buyRoutes.filter((r) => r.id !== route.id)})))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsBuyLoading((obj) => update(obj, { [route.id]: false })));
  };
  const deleteSellRoute = (route: SellRoute) => {
    setIsSellLoading((obj) => update(obj, { [route.id]: true }));
    route.active = false;
    putSellRoute(route)
      .then(() => setRoutes((routes) => update(routes, {sellRoutes: routes?.sellRoutes.filter((r) => r.id !== route.id)})))
      .catch(() => NotificationService.show(t("feedback.delete_failed")))
      .finally(() => setIsSellLoading((obj) => update(obj, { [route.id]: false })));
  };

  return (
    <>
      <DeFiModal isVisible={isBuyRouteEdit} setIsVisible={setIsBuyRouteEdit} title={t("model.route.new_buy")}>
        <BuyRouteEdit isVisible={isBuyRouteEdit} onRouteCreated={onBuyRouteChanged} />
      </DeFiModal>
      <DeFiModal isVisible={isSellRouteEdit} setIsVisible={setIsSellRouteEdit} title={t("model.route.new_sell")}>
        <SellRouteEdit isVisible={isSellRouteEdit} user={user} onRouteCreated={onSellRouteChanged} />
      </DeFiModal>

      <View style={AppStyles.containerHorizontal}>
        <H2 text={t("model.route.routes")} />
        {device.SM && (
          <>
            <Text style={AppStyles.mla}>{t("model.route.new")}</Text>
            <View style={AppStyles.ml10}>
              <Button color={Colors.Primary} title={t("model.route.buy")} onPress={() => setIsBuyRouteEdit(true)} />
            </View>
            <View style={AppStyles.ml10}>
              <Button color={Colors.Primary} title={t("model.route.sell")} onPress={() => setIsSellRouteEdit(true)} />
            </View>
          </>
        )}
      </View>

      {/* TODO: what if collision with deleted route? */}
      {/* => reactivate route */}
      {/* multiple times same asset with different iban possible */}
      {/* TODO: details */}

      {(routes?.buyRoutes.length ?? 0) + (routes?.sellRoutes.length ?? 0) > 0 ? (
        <>
          {routes?.buyRoutes && routes.buyRoutes.length > 0 && (
            <>
              <SpacerV />
              <H3 text={t("model.route.buy")} />

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.asset")}</CompactTitle>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.iban")}</CompactTitle>
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.bank_usage")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <Icon name="delete" color={Colors.Primary} style={AppStyles.hidden} />
                  </CompactTitle>
                </CompactHeader>

                {routes.buyRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.asset.name}</CompactCell>
                    <CompactCell style={{ flex: 1 }}>{route.iban}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.bankUsage}</CompactCell>
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton
                        type="material"
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
          {routes?.sellRoutes && routes.sellRoutes.length > 0 && (
            <>
              <SpacerV height={20} />
              <H3 text={t("model.route.sell")} />

              <DataTable>
                <CompactHeader>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.fiat")}</CompactTitle>
                  <CompactTitle style={{ flex: 1 }}>{t("model.route.iban")}</CompactTitle>
                  <CompactTitle style={{ flex: 2 }}>{t("model.route.deposit_address")}</CompactTitle>
                  <CompactTitle style={{ flex: undefined }}>
                    <Icon name="delete" color={Colors.Primary} style={AppStyles.hidden} />
                  </CompactTitle>
                </CompactHeader>

                {routes.sellRoutes.map((route) => (
                  <CompactRow key={route.id}>
                    <CompactCell style={{ flex: 1 }}>{route.fiat.name}</CompactCell>
                    <CompactCell style={{ flex: 1 }}>{route.iban}</CompactCell>
                    <CompactCell style={{ flex: 2 }}>{route.depositAddress}</CompactCell>
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton
                        type="material"
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
