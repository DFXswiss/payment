import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Paragraph } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import ButtonContainer from "../components/util/ButtonContainer";
import Routes from "../config/Routes";
import { DeFiButton } from "../elements/Buttons";
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
      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("gtc.title")} />
      <SpacerV height={20} />

      {[...Array(gtcLength).keys()].map((_, i) => (
        <View key={i}>
          {t(`gtc.text.${i}.title`) ? <H3 style={styles.title} text={t(`gtc.text.${i}.title`)} /> : null}
          <Paragraph style={styles.paragraph}>{t(`gtc.text.${i}.text`)}</Paragraph>
        </View>
      ))}

      <SpacerV />

      <ButtonContainer>
        {/* TODO: toast appears on back button click */}
        <DeFiButton link onPress={() => nav.navigate(Routes.Login)}>
          {t("action.back")}
        </DeFiButton>
        <DeFiButton mode="contained" loading={isProcessing} onPress={register}>
          {t("action.accept")}
        </DeFiButton>
      </ButtonContainer>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  title: { marginTop: 10 },
  paragraph: { textAlign: "justify" },
});

export default withSession(GtcScreen);
