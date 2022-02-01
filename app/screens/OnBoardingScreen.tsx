import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { Session } from "../services/AuthService";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { getUser, postKyc } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { KycStatus } from "../models/User";

const OnBoardingScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [kycState, setKycState] = useState<KycStatus>();

  useAuthGuard(session);

  useEffect(() => {
    // get params
    const params = route.params as any;
    setUrl(params?.url);
    setKycState(params?.kycStatus);

    // reset params
    nav.navigate(Routes.OnBoarding, { url: undefined, kycStatus: undefined });
  }, []);

  const finishChatBot = () => {
    setLoading(true);
    postKyc()
      .then((url: string | undefined) => {
        getUser().then((user) => {
          if (user.kycStatus !== KycStatus.WAIT_CHAT_BOT && url) {
            setKycState(user.kycStatus);
            setUrl(url);
          } else {
            NotificationService.error(t("model.kyc.not_finish_chatbot"));
          }
        });
      })
      .catch(() => NotificationService.error(t("model.kyc.not_finish_chatbot")))
      .finally(() => setLoading(false));
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Iframe src={url}></Iframe>
        {kycState === KycStatus.WAIT_CHAT_BOT || kycState === KycStatus.NA && (
          <DeFiButton onPress={finishChatBot} loading={isLoading}>
            {t("model.kyc.finish_chatbot")}
          </DeFiButton>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
});

export default withSession(OnBoardingScreen);
