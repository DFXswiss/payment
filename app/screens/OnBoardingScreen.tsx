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
const [isLoading, setLoading] = useState(true);
const [isShow, setShow] = useState(KycStatus.WAIT_CHAT_BOT || KycStatus.WAIT_VERIFY_ONLINE || KycStatus.WAIT_VERIFY_VIDEO);
const nav = useNavigation();
const route = useRoute();
const [url, setUrl] = useState("");
  useAuthGuard(session);

  useEffect(() => {
    const params = route.params as any;
    setUrl(params?.url);
    setShow(params?.kycStatus)
    // reset params
    nav.navigate(Routes.OnBoarding, { url: undefined, kycStatus: undefined });
  }, []);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <View style={styles.container}>
      <Iframe src={url}></Iframe>
      { isShow === KycStatus.WAIT_CHAT_BOT ? 
      <DeFiButton onPress={() => {
  setLoading(true);
  postKyc()
    .then((url: string | undefined) => {
      getUser()
      .then((user) => 
          {if(url) {
            setShow(user.kycStatus);
            setUrl(url);
          } else {
            NotificationService.error(t("feedback.not_finish_chatbot"));
          }
        })
        })
    .catch(() => NotificationService.error(t("feedback.not_finish_chatbot")))
    .finally(() => setLoading(false));
}} compact>
              {t("model.kyc.finish_chatbot")}
            </DeFiButton>: null}
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
