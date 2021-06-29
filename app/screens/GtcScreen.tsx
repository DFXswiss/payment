import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Text } from "react-native";
import AppLayout from "../components/AppLayout";
import LoadingButton from "../components/util/LoadingButton";
import Routes from "../config/Routes";
import { ActionLink } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";

const gtcLength = require("../i18n/de.json").common.gtc.text.length - 1;

const GtcScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(false);

  useGuard(() => session && !(session.address && session.signature), [session]);
  useGuard(() => session && session.isLoggedIn, [session], Routes.Home);

  const register = () => {
    setIsProcessing(true);
    SessionService.register(session)
      .finally(() => setIsProcessing(false))
      .then(() => nav.navigate(Routes.Home))
      .catch(() => NotificationService.show(t("feedback.register_failed")));
  };

  return (
    <AppLayout>
      <View style={AppStyles.container}>
        <H1 style={AppStyles.center} text={t("gtc.title")} />

        <SpacerV height={50} />

        {[...Array(gtcLength).keys()].map((_, i) => (
          <View key={i}>
            <H3 text={t(`gtc.text.${i}.title`)} />
            <Text style={styles.gtcText}>{t(`gtc.text.${i}.text`)}</Text>
          </View>
        ))}

        <SpacerV />

        <View style={AppStyles.containerHorizontal}>
          <ActionLink label={t("action.back")} onPress={() => nav.navigate(Routes.Login)} />
          <View style={AppStyles.mla}>
            <LoadingButton title={t("action.accept")} isLoading={isProcessing} onPress={register} />
          </View>
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  gtcText: { marginBottom: 10 }
});

export default withSession(GtcScreen);
