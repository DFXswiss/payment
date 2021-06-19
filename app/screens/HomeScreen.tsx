import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { Text, View } from "react-native";
import DeFiModal from "../components/DeFiModal";
import Loading from "../components/Loading";
import Row from "../components/Row";
import UserEdit from "../components/edit/UserEdit";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { SpacerV } from "../elements/Spacers";
import { H1, H2, H3 } from "../elements/Texts";
import withCredentials from "../hocs/withCredentials";
import { PaymentRoutes } from "../models/PaymentRoutes";
import { User } from "../models/User";
import { getActiveRoutes, getUser } from "../services/ApiService";
import AppStyles from "../styles/AppStyles";
import BuyRouteEdit from "../components/edit/BuyRouteEdit";
import { BuyRoute } from "../models/BuyRoute";
import SellRouteEdit from "../components/edit/SellRouteEdit";
import { SellRoute } from "../models/SellRoute";
import { Credentials } from "../services/AuthService";

const HomeScreen = ({ credentials }: { credentials?: Credentials }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const isFocused = useIsFocused();

  // TODO: full KYC Access

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [routes, setRoutes] = useState<PaymentRoutes>();
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);

  const onUserChanged = (user: User) => {
    setUser(user);
    setIsUserEdit(false);
  };
  const onBuyRouteChanged = (route: BuyRoute) => {
    setRoutes((routes) => {
      routes?.buyRoutes.push(route);
      return routes;
    });
    setIsBuyRouteEdit(false);
  };
  const onSellRouteChanged = (route: SellRoute) => {
    setRoutes((routes) => {
      routes?.sellRoutes.push(route);
      return routes;
    });
    setIsSellRouteEdit(false);
  };

  const reset = (): void => {
    setLoading(true);
    setUser(undefined);
    setRoutes(undefined);
    setIsUserEdit(false);
    setIsBuyRouteEdit(false);
    setIsSellRouteEdit(false);
  };

  useEffect(() => {
    if (credentials) {
      if (credentials.isLoggedIn) {
        Promise.all([getUser().then((user) => setUser(user)), getActiveRoutes().then((routes) => setRoutes(routes))])
          // TODO: error handling
          .finally(() => setLoading(false));
      } else {
        reset();
        nav.navigate(Routes.Login);
      }
    }
  }, [credentials, isFocused]);

  return (
    <>
      <DeFiModal isVisible={isUserEdit} setIsVisible={setIsUserEdit} title={t("model.user.edit")}>
        <UserEdit isVisible={isUserEdit} user={user} onUserChanged={onUserChanged} />
      </DeFiModal>
      <DeFiModal isVisible={isBuyRouteEdit} setIsVisible={setIsBuyRouteEdit} title={t("model.route.new_buy")}>
        <BuyRouteEdit isVisible={isBuyRouteEdit} onRouteCreated={onBuyRouteChanged} />
      </DeFiModal>
      <DeFiModal isVisible={isSellRouteEdit} setIsVisible={setIsSellRouteEdit} title={t("model.route.new_sell")}>
        <SellRouteEdit isVisible={isSellRouteEdit} onRouteCreated={onSellRouteChanged} />
      </DeFiModal>

      <View style={AppStyles.container}>
        <H1 text={t("welcome")} style={AppStyles.center} />

        <SpacerV height={50} />

        {isLoading && <Loading size="large" />}

        {!isLoading ? (
          <>
            {user && (
              <View>
                <View style={AppStyles.containerHorizontal}>
                  <H2 text={t("model.user.your_data")} />
                  <View style={AppStyles.mla}>
                    <Button color={Colors.Primary} title={t("action.edit")} onPress={() => setIsUserEdit(true)} />
                  </View>
                </View>
                {user.address ? <Row cells={[t("model.user.address"), user.address]} /> : null}
                {(user.firstName || user.lastName) ? <Row cells={[t("model.user.name"), `${user.firstName} ${user.lastName}`]} /> : null}
                {(user.street || user.houseNumber) ? <Row cells={[t("model.user.home"), `${user.street} ${user.houseNumber}`]} /> : null}
                {user.zip ? <Row cells={[t("model.user.zip"), user.zip]} /> : null}
                {user.location ? <Row cells={[t("model.user.location"), user.location]} /> : null}
                {user.country ? <Row cells={[t("model.user.country"), user.country.name]} /> : null}
                {user.mail ? <Row cells={[t("model.user.mail"), user.mail]} /> : null}
                {user.phoneNumber ? <Row cells={[t("model.user.phone_number"), user.phoneNumber]} /> : null}
                {user.usedRef ? <Row cells={[t("model.user.used_ref"), user.usedRef]} /> : null}
                {/* TODO: KYC status, gebühr */}

                <SpacerV />
                {user.ref ? <Row cells={[t("model.user.ref"), user.ref]} /> : null}
              </View>
            )}

            <SpacerV height={50} />

            {routes && (
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

                {/* TODO: delete routes */}
                {/* TODO: what if collision with deleted route? */}
                {/* TODO: details */}
                {routes.buyRoutes?.length + routes.sellRoutes?.length > 0 ? (
                  <>
                    {routes.buyRoutes?.length > 0 && (
                      <>
                        <SpacerV />
                        <H3 text={t("model.route.buy")} />
                        <SpacerV />
                        <Row
                          textStyle={AppStyles.b}
                          cells={[t("model.route.asset"), t("model.route.iban"), t("model.route.bank_usage")]}
                          layout={[1, 1, 2]}
                        />
                        {routes.buyRoutes.map((route) => (
                          <Row
                            key={route.id}
                            cells={[route.asset.name, route.iban, route.bankUsage]}
                            layout={[1, 1, 2]}
                          />
                        ))}
                      </>
                    )}
                    {routes.sellRoutes?.length > 0 && (
                      <>
                        <SpacerV />
                        <H3 text={t("model.route.sell")} />
                        <SpacerV />
                        <Row
                          textStyle={AppStyles.b}
                          cells={[t("model.route.fiat"), t("model.route.iban"), t("model.route.deposit_address")]}
                          layout={[1, 1, 2]}
                        />
                        {routes.sellRoutes.map((route) => (
                          <Row
                            key={route.id}
                            cells={[route.fiat.name, route.iban, route.depositAddress]}
                            layout={[1, 1, 2]}
                          />
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <Text style={AppStyles.i}>{t("model.route.none")}</Text>
                )}
              </View>
            )}
          </>
        ) : null}
      </View>
    </>

    // TODO: remove change logo PNG
    // <View style={[AppStyles.container, styles.container]}>
    //   <Image
    //     style={styles.image}
    //     source={require("../assets/change_logo.png")}
    //   />
    //   <Text style={styles.text}>
    //     <Text style={{ color: colors.Primary }}>DEFI</Text>CHANGE
    //   </Text>
    //   <Text>{t('coming_soon')}</Text>
    // </View>
  );
};

export default withCredentials(HomeScreen);
