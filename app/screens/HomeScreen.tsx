import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import Loading from "../components/Loading";
import Row from "../components/Row";
import Colors from "../config/Colors";
import { Spacer10, Spacer50 } from "../elements";
import { PaymentRoutes } from "../models/PaymentRoutes";
import { User } from "../models/User";
import { getRoutes, getUser } from "../services/ApiService";
import AppStyles from "../styles/AppStyles";

const HomeScreen = () => {
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [routes, setRoutes] = useState<PaymentRoutes>();

  useEffect(() => {
    Promise.all([getUser().then((user) => setUser(user)), getRoutes().then((routes) => setRoutes(routes))])
      // TODO: error handling
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={AppStyles.container}>
      <Text style={[AppStyles.h1, { textAlign: "center" }]}>{t("welcome")}</Text>

      <Spacer50 />

      {isLoading && <Loading />}

      {!isLoading ? (
        <View>
          {user && (
            <View>
              <View style={AppStyles.containerHorizontal}>
                <Text style={AppStyles.h2}>{t("model.user.your_data")}</Text>
                <View style={AppStyles.mla}>
                  <Button color={Colors.Primary} title={t("action.edit")} onPress={() => {}} />
                </View>
              </View>
              {user.address ? <Row cells={[t("model.user.address"), user.address]} /> : null}
              {user.firstname ? <Row cells={[t("model.user.firstname"), user.firstname]} /> : null}
              {user.surname ? <Row cells={[t("model.user.surname"), user.surname]} /> : null}
              {user.street ? <Row cells={[t("model.user.street"), user.street]} /> : null}
              {user.zip ? <Row cells={[t("model.user.zip"), user.zip]} /> : null}
              {user.location ? <Row cells={[t("model.user.location"), user.location]} /> : null}
              {user.mail ? <Row cells={[t("model.user.mail"), user.mail]} /> : null}
              {user.phone_number ? <Row cells={[t("model.user.phone_number"), user.phone_number]} /> : null}
              {user.used_ref ? <Row cells={[t("model.user.used_ref"), user.used_ref]} /> : null}
              {/* TODO: KYC status, gebühr */}

              <Spacer10 />
              {user.ref ? <Row cells={[t("model.user.ref"), user.ref]} /> : null}
            </View>
          )}

          <Spacer50 />

          {routes && (
            <View>
              <View style={AppStyles.containerHorizontal}>
                <Text style={AppStyles.h2}>{t("model.routes.routes")}</Text>
                <Text style={[AppStyles.mla, AppStyles.mr10]}>{t("model.routes.new")}</Text>
                <View style={AppStyles.mr10}>
                  <Button color={Colors.Primary} title={t("model.routes.fiat2crypto")} onPress={() => {}} />
                </View>
                <Button color={Colors.Primary} title={t("model.routes.crypto2fiat")} onPress={() => {}} />
              </View>

              {routes.fiat2crypto?.length + routes.crypto2fiat?.length > 0 ? (
                <Text>TODO</Text>
              ) : (
                <Text style={AppStyles.i}>{t("model.routes.none")}</Text>
              )}
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  // TODO
});

export default HomeScreen;
