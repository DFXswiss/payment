import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { Text, View } from "react-native";
import DeFiModal from "../components/DeFiModal";
import Loading from "../components/Loading";
import Row from "../components/Row";
import UserEdit from "../components/UserEdit";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { SpacerV } from "../elements/Elements";
import { PaymentRoutes } from "../models/PaymentRoutes";
import { User } from "../models/User";
import { getActiveRoutes, getUser, isLoggedIn } from "../services/ApiService";
import AppStyles from "../styles/AppStyles";

const HomeScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [routes, setRoutes] = useState<PaymentRoutes>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // TODO: subscribe (does not work correctly)
    isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        Promise.all([getUser().then((user) => setUser(user)), getActiveRoutes().then((routes) => setRoutes(routes))])
          // TODO: error handling
          .finally(() => setLoading(false));
      } else {
        nav.navigate(Routes.Login);
      }
    });
  }, []);

  return (
    <View style={AppStyles.container}>
      <Text style={[AppStyles.h1, { textAlign: "center" }]}>{t("welcome")}</Text>

      <SpacerV height={50} />

      <DeFiModal isVisible={isVisible} setIsVisible={setIsVisible} title={t("model.user.edit")} save={t("action.save")}>
        <UserEdit
          user={user}
          onUserChanged={(user) => {
            setUser(user);
            setIsVisible(false);
          }}
        ></UserEdit>
      </DeFiModal>

      {isLoading && <Loading size="large" />}

      {!isLoading ? (
        <>
          {user && (
            <View>
              <View style={AppStyles.containerHorizontal}>
                <Text style={AppStyles.h2}>{t("model.user.your_data")}</Text>
                <View style={AppStyles.mla}>
                  <Button color={Colors.Primary} title={t("action.edit")} onPress={() => setIsVisible(true)} />
                </View>
              </View>
              {user.address ? <Row cells={[t("model.user.address"), user.address]} /> : null}
              {user.firstName ? <Row cells={[t("model.user.first_name"), user.firstName]} /> : null}
              {user.lastName ? <Row cells={[t("model.user.last_name"), user.lastName]} /> : null}
              {user.street ? <Row cells={[t("model.user.street"), user.street]} /> : null}
              {user.zip ? <Row cells={[t("model.user.zip"), user.zip]} /> : null}
              {user.location ? <Row cells={[t("model.user.location"), user.location]} /> : null}
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
                <Text style={AppStyles.h2}>{t("model.route.routes")}</Text>
                <Text style={AppStyles.mla}>{t("model.route.new")}</Text>
                <View style={AppStyles.ml10}>
                  <Button color={Colors.Primary} title={t("model.route.buy")} onPress={() => {}} />
                </View>
                <View style={AppStyles.ml10}>
                  <Button color={Colors.Primary} title={t("model.route.sell")} onPress={() => {}} />
                </View>
              </View>

              {/* TODO: delete routes */}
              {/* TODO: details */}
              {routes.buyRoutes?.length + routes.sellRoutes?.length > 0 ? (
                <>
                  {routes.buyRoutes?.length > 0 && (
                    <>
                      <SpacerV />
                      <Text style={AppStyles.h3}>{t("model.route.buy")}</Text>
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
                      <Text style={AppStyles.h3}>{t("model.route.sell")}</Text>
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

export default HomeScreen;
