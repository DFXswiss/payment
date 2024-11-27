import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import { H1, H3 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { openUrl } from "../utils/Utils";
import { Environment } from "../env/Environment";

export enum ErrorScreenType {
  LOGIN_FAILED = "login_failed",
}

const ErrorScreen = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const [screenType] = useState<ErrorScreenType>();

  const params = route.params as any;

  useEffect(() => {
    openUrl(Environment.services, false);
  }, []);

  const keyFor = (screenType?: ErrorScreenType): string => screenType ?? "general";

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t(`error.${keyFor(screenType)}.title`)} />
        <H3 text={t(`error.${keyFor(screenType)}.description`)} />
        {screenType === ErrorScreenType.LOGIN_FAILED && (
          <>
            <SpacerV height={20} />
            <DeFiButton onPress={() => openUrl(`${Environment.services}/my-dfx`, false)} mode="contained">
              {t("action.login")}
            </DeFiButton>
          </>
        )}
      </View>
    </AppLayout>
  );
};

export default ErrorScreen;
