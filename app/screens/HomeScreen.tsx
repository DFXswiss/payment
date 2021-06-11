import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Row from "../components/Row";
import { getUser, User } from "../services/ApiService";
import AppStyles from "../styles/AppStyles";

const HomeScreen = () => {
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getUser()
      .then((user) => setUser(user)) // TODO: error handling
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={AppStyles.container}>
      <Text style={[AppStyles.h1, { textAlign: "center" }]}>
        {t("welcome")}
      </Text>
      <Text style={AppStyles.h2}>{t("model.user.your_data")}</Text>

      {/* TODO: loading component */}
      {isLoading && <Text>Loading ...</Text>}
      {user && (
        <View>
          {user.address ? <Row cells={[t("model.user.address"), user.address]} /> : null}
          {user.firstname ? <Row cells={[t("model.user.firstname"), user.firstname]} /> : null}
          {user.surname ? <Row cells={[t("model.user.surname"), user.surname]} /> : null}
          {user.street ? <Row cells={[t("model.user.street"), user.street]} /> : null}
          {user.zip ? <Row cells={[t("model.user.zip"), user.zip]} /> : null}
          {user.location ? <Row cells={[t("model.user.location"), user.location]} /> : null}
          {user.mail ? <Row cells={[t("model.user.mail"), user.mail]} /> : null}
          {user.phone_number ? <Row cells={[t("model.user.phone_number"), user.phone_number]} /> : null}
          {user.used_ref ? <Row cells={[t("model.user.used_ref"), user.used_ref]} /> : null}
        </View>
      )}
    </View>

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
  // container: {
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // text: {
  //   fontWeight: "bold",
  //   fontSize: 30,
  // },
  // image: {
  //   marginBottom: "1rem",
  //   width: 333,
  //   height: 270,
  // },
});

export default HomeScreen;
