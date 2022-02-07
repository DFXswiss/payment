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

const IdentScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [kycStatus, setKycStatus] = useState<KycStatus>();

  useAuthGuard(session);

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (params?.url && params?.kycStatus) {
      setUrl(params.url);
      setKycStatus(params.kycStatus);

      // reset params
      nav.navigate(Routes.Ident, { url: undefined, kycStatus: undefined });
    } else {
      nav.navigate(Routes.Home);
    }
  }, []);

  const finishChatBot = () => {
    setLoading(true);
    postKyc()
      .then((result: KycResult) => {
        if (result.status === KycStatus.CHATBOT || !result.identUrl) {
          NotificationService.error(t("model.kyc.chatbot_not_finished"));
        } else {
          setKycStatus(result.status);
          setUrl(result.identUrl);
        }
      })
      .catch(() => NotificationService.error(t("model.kyc.chatbot_not_finished")))
      .finally(() => setLoading(false));
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Iframe src={url}></Iframe>
        {kycStatus === KycStatus.CHATBOT && (
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

export default withSession(IdentScreen);
