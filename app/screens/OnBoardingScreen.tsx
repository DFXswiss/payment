import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
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
  const [isChatBot, setChatBot] = useState<boolean>();

  useAuthGuard(session);

  useEffect(() => {
    // get params
    const params = route.params as any;
    setUrl(params?.url);
    setChatBot(params?.kycStatus == KycStatus.WAIT_CHAT_BOT || params?.kycStatus == KycStatus.NA);

    // reset params
    nav.navigate(Routes.OnBoarding, { url: undefined, kycStatus: undefined });
  }, []);

  const finishChatBot = () => {
    setLoading(true);
    postKyc()
      .then((url: string | undefined) => {
        getUser().then((user) => {
          if (user.kycStatus !== KycStatus.WAIT_CHAT_BOT && url) {
            setChatBot(true);
            setUrl(url);
          } else {
            NotificationService.error(t("model.kyc.not_finish_chatbot"));
          }
        });
      })
      .catch(() => NotificationService.error(t("model.kyc.not_finish_chatbot")))
      .finally(() => setLoading(false));
  };

  getUser().then((user) => setChatBot(user?.kycStatus == KycStatus.WAIT_CHAT_BOT || user?.kycStatus == KycStatus.NA));

  return (
    <AppLayout>
      <View style={styles.container}>
        <Iframe src={url}></Iframe>
        <DeFiButton onPress={finishChatBot} loading={isLoading} visible={isChatBot}>
          {t("model.kyc.finish_chatbot")}
        </DeFiButton>
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
