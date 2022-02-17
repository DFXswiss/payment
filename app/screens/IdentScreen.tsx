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
import { getKyc } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { KycResult, KycStatus } from "../models/User";
import { sleep } from "../utils/Utils";
import KycInit from "../components/KycInit";

const IdentScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState<string | undefined>();
  const [identUrl, setIdentUrl] = useState<string | undefined>();
  const [setupUrl, setSetupUrl] = useState<string | undefined>();
  const [kycStatus, setKycStatus] = useState<KycStatus>();

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (!params?.code) return onLoadFailed();

    setCode(params.code);

    // reset params
    nav.navigate(Routes.Ident, { code: undefined });

    // get KYC info
    getKyc(params?.code)
      .then(updateState)
      .catch(onLoadFailed);
  }, []);

  const finishChatBot = (nthTry = 13): Promise<void> => {
    setIsLoading(true);
    return getKyc(code)
      .then((result: KycResult) => {
        if (result.status === KycStatus.CHATBOT || !result.identUrl) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => finishChatBot(nthTry - 1));
          }

          throw Error();
        } else {
          updateState(result);
        }
      })
      .catch(() => {
        setIsLoading(false);
        NotificationService.error(t("model.kyc.chatbot_not_finished"));
      });
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const updateState = (result: KycResult) => {
    setIdentUrl(result.identUrl);
    setSetupUrl(result.setupUrl);

    // wait for new page to load
    setTimeout(() => {
      setKycStatus(result.status);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      {identUrl && (
        <View style={styles.container}>
          {setupUrl && (
            <View style={styles.hiddenIframe}>
              <Iframe src={setupUrl} />
            </View>
          )}
          <Iframe src={identUrl} />

          {kycStatus === KycStatus.CHATBOT && (
            <DeFiButton onPress={() => finishChatBot()} loading={isLoading} labelStyle={styles.chatbotButton}>
              {t("model.kyc.finish_chatbot")}
            </DeFiButton>
          )}
        </View>
      )}
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
  chatbotButton: {
    fontSize: 18,
  },
});

export default withSession(IdentScreen);
