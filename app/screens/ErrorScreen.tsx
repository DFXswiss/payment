import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { H1, H3 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";

export enum ErrorScreenType {
  LOGIN_FAILED,
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

  const titleFor = (screenType?: ErrorScreenType): string => {
    switch (screenType) {
      case ErrorScreenType.LOGIN_FAILED:
        return t("error.login_failed.title");
      default:
        return t("error.general.title");
    }
  };

  const descriptionFor = (screenType?: ErrorScreenType): string => {
    switch (screenType) {
      case ErrorScreenType.LOGIN_FAILED:
        return t("error.login_failed.description");
      default:
        return t("error.general.description");
    }
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={titleFor(screenType)} />
        <H3 text={descriptionFor(screenType)} />
      </View>
    </AppLayout>
  );
};

export default ErrorScreen;
