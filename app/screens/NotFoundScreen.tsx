import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { ActionLink } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";
import { Environment } from "../env/Environment";
import { openUrl } from "../utils/Utils";

const NotFoundScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();
  useEffect(() => {
    let url = `${Environment.services}`;
    openUrl(url, false);
  }, []);
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
