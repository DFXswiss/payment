import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { ActionLink } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";

const NotFoundScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("feedback.page_not_found")} />
        <SpacerV height={30} />
        <ActionLink onPress={() => nav.navigate(Routes.Home)} label={t("action.home")} />
      </View>
    </AppLayout>
  );
};

export default NotFoundScreen;
