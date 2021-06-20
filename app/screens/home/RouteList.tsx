import React, { useState } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View, Button, Text } from "react-native";
import { Icon } from "react-native-elements";
import BuyRouteEdit from "../../components/edit/BuyRouteEdit";
import SellRouteEdit from "../../components/edit/SellRouteEdit";
import DeFiModal from "../../components/util/DeFiModal";
import IconButton from "../../components/util/IconButton";
import Row from "../../components/util/Row";
import Colors from "../../config/Colors";
import { SpacerV } from "../../elements/Spacers";
import { H2, H3 } from "../../elements/Texts";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { putBuyRoute, putSellRoute } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";

interface Props {
  buyRoutes?: BuyRoute[];
  setBuyRoutes: Dispatch<SetStateAction<BuyRoute[] | undefined>>;
  sellRoutes?: SellRoute[];
  setSellRoutes: Dispatch<SetStateAction<SellRoute[] | undefined>>;
  user?: User;
}

const RouteList = ({ buyRoutes, setBuyRoutes, sellRoutes, setSellRoutes, user }: Props) => {
  const { t } = useTranslation();

  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);
  const [isBuyLoading, setIsBuyLoading] = useState<{ [id: string]: boolean }>({});
  const [isSellLoading, setIsSellLoading] = useState<{ [id: string]: boolean }>({});

  const onBuyRouteChanged = (route: BuyRoute) => {
    setBuyRoutes((routes) => {
      routes?.push(route);
      return routes;
    });
    setIsBuyRouteEdit(false);
  };
  const onSellRouteChanged = (route: SellRoute) => {
    setSellRoutes((routes) => {
      sellRoutes?.push(route);
      return routes;
    });
    setIsSellRouteEdit(false);
  };

  const deleteBuyRoute = (route: BuyRoute) => {
    setIsBuyLoading((obj) => update(obj, {[route.id]: true}));
    console.log(isBuyLoading[route.id]);
    route.active = false;
    putBuyRoute(route)
      .then(() => setBuyRoutes((routes) => routes?.filter((r) => r.id !== route.id)))
      .finally(() => setIsBuyLoading((obj) => update(obj, {[route.id]: false})));
  };
  const deleteSellRoute = (route: SellRoute) => {
    setIsSellLoading((obj) => update(obj, {[route.id]: true}));
    route.active = false;
    putSellRoute(route)
      .then(() => setSellRoutes((routes) => routes?.filter((r) => r.id !== route.id)))
      .finally(() => setIsSellLoading((obj) => update(obj, {[route.id]: false})));
  };

  return (
    <>
      <DeFiModal isVisible={isBuyRouteEdit} setIsVisible={setIsBuyRouteEdit} title={t("model.route.new_buy")}>
        <BuyRouteEdit isVisible={isBuyRouteEdit} onRouteCreated={onBuyRouteChanged} />
      </DeFiModal>
      <DeFiModal isVisible={isSellRouteEdit} setIsVisible={setIsSellRouteEdit} title={t("model.route.new_sell")}>
        <SellRouteEdit isVisible={isSellRouteEdit} user={user} onRouteCreated={onSellRouteChanged} />
      </DeFiModal>

      <View>
        <View style={AppStyles.containerHorizontal}>
          <H2 text={t("model.route.routes")} />
          <Text style={AppStyles.mla}>{t("model.route.new")}</Text>
          <View style={AppStyles.ml10}>
            <Button color={Colors.Primary} title={t("model.route.buy")} onPress={() => setIsBuyRouteEdit(true)} />
          </View>
          <View style={AppStyles.ml10}>
            <Button color={Colors.Primary} title={t("model.route.sell")} onPress={() => setIsSellRouteEdit(true)} />
          </View>
        </View>
        {/* TODO: what if collision with deleted route? */}
        {/* TODO: details */}
        {(buyRoutes?.length ?? 0) + (sellRoutes?.length ?? 0) > 0 ? (
          <>
            {buyRoutes && buyRoutes.length > 0 && (
              <>
                <SpacerV />
                <H3 text={t("model.route.buy")} />
                <SpacerV />
                <Row
                  textStyle={AppStyles.b}
                  cells={[
                    t("model.route.asset"),
                    t("model.route.iban"),
                    t("model.route.bank_usage"),
                    <Icon name="delete" color={Colors.Primary} style={AppStyles.hidden} />,
                  ]}
                  layout={[1, 1, 2, undefined]}
                />
                {buyRoutes.map((route) => (
                  <Row
                    key={route.id}
                    cells={[
                      route.asset.name,
                      route.iban,
                      route.bankUsage,
                      <IconButton
                        icon="delete"
                        color={Colors.Primary}
                        onPress={() => deleteBuyRoute(route)}
                        isLoading={isBuyLoading[route.id]}
                      />,
                    ]}
                    layout={[1, 1, 2, undefined]}
                  />
                ))}
              </>
            )}
            {sellRoutes && sellRoutes.length > 0 && (
              <>
                <SpacerV />
                <H3 text={t("model.route.sell")} />
                <SpacerV />
                <Row
                  textStyle={AppStyles.b}
                  cells={[
                    t("model.route.fiat"),
                    t("model.route.iban"),
                    t("model.route.deposit_address"),
                    <Icon name="delete" color={Colors.Primary} style={AppStyles.hidden} />,
                  ]}
                  layout={[1, 1, 2, undefined]}
                />
                {sellRoutes.map((route) => (
                  <Row
                    key={route.id}
                    cells={[
                      route.fiat.name,
                      route.iban,
                      route.depositAddress,
                      <IconButton
                        icon="delete"
                        color={Colors.Primary}
                        onPress={() => deleteSellRoute(route)}
                        isLoading={isSellLoading[route.id]}
                      />,
                    ]}
                    layout={[1, 1, 2, undefined]}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <Text style={AppStyles.i}>{t("model.route.none")}</Text>
        )}
      </View>
    </>
  );
};

export default RouteList;
