import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Routes from "../config/Routes";
import { SpacerV } from "../elements/Spacers";
import { H1, ActionLink } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";

const NotFoundScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();

  return (
    <View style={[AppStyles.container, styles.container]}>
      <H1 text={t("feedback.page_not_found")} />
      <SpacerV height={30} />
      <ActionLink action={() => nav.navigate(Routes.Home)} label={t("action.home")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});

export default NotFoundScreen;
