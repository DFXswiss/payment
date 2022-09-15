import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { H1, H3 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";

export enum ErrorScreenType {
  LOGIN_FAILED = "login_failed",
}

const ErrorScreen = () => {
  const route = useRoute();
  const nav = useNavigation();
  const { t } = useTranslation();
  const [screenType, setScreenType] = useState<ErrorScreenType>();

  const params = route.params as any;

  useEffect(() => {
    setScreenType(params?.screenType as ErrorScreenType);
    nav.navigate(Routes.Error, {
      screenType: undefined,
    });
  }, []);

  const keyFor = (screenType?: ErrorScreenType): string => screenType ?? "general";

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t(`error.${keyFor(screenType)}.title`)} />
        <H3 text={t(`error.${keyFor(screenType)}.description`)} />
      </View>
    </AppLayout>
  );
};

export default ErrorScreen;
