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
import { postKyc } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { KycResult, KycStatus } from "../models/User";
import { sleep } from "../utils/Utils";
import { SpacerV } from "../elements/Spacers";
import Colors from "../config/Colors";
import KycInit from "../components/KycInit";

const IdentScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [setupUrl, setSetupUrl] = useState<string | undefined>();
  const [kycStatus, setKycStatus] = useState<KycStatus>();

  useAuthGuard(session);

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (params?.url && params?.status) {
      setUrl(params.url);
      setSetupUrl(params.setupUrl);
      setKycStatus(params.status);

      // reset params
      nav.navigate(Routes.Ident, { status: undefined, url: undefined, setupUrl: undefined });
    } else {
      nav.navigate(Routes.Home);
    }
  }, []);

  const finishChatBot = (nthTry = 13): Promise<void> => {
    setIsLoading(true);
    return postKyc()
      .then((result: KycResult) => {
        if (result.status === KycStatus.CHATBOT || !result.identUrl) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => finishChatBot(nthTry - 1));
          }
          NotificationService.error(t("model.kyc.chatbot_not_finished"));
        } else {
          setUrl(result.identUrl);
          setSetupUrl(result.setupUrl);
          // wait for new page to load
          setTimeout(() => setKycStatus(result.status), 1000);
        }
      })
      .catch(() => NotificationService.error(t("model.kyc.chatbot_not_finished")))
      .finally(() => setIsLoading(false));
  };

  return (
    <AppLayout>
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <View style={styles.container}>
        {setupUrl && (
          <View style={styles.hiddenIframe}>
            <Iframe src={setupUrl} />
          </View>
        )}
        <Iframe src={url} />

        {kycStatus === KycStatus.CHATBOT && (
          <>
            <SpacerV height={10} />
            <View style={styles.chatbotButtonContainer}>
              <DeFiButton onPress={() => finishChatBot()} loading={isLoading} labelStyle={styles.chatbotButton}>
                {t("model.kyc.finish_chatbot")}
              </DeFiButton>
            </View>
          </>
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
  hiddenIframe: {
    height: 0,
    overflow: "hidden",
  },
  chatbotButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50,
    backgroundColor: Colors.Blue,
    justifyContent: "flex-end",
  },
  chatbotButton: {
    fontSize: 18,
  },
});

export default withSession(IdentScreen);
