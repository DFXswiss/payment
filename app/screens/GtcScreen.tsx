import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { FAB, Paragraph, Portal } from "react-native-paper";
import AppLayout, { scrollRef } from "../components/AppLayout";
import Routes from "../config/Routes";
import { ActionLink, DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
import withScroll from "../hocs/withScroll";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";

const gtcLength = require("../i18n/de.json").common.gtc.text.length - 1;

const GtcScreen = ({ session, scrollPosition }: { session?: Session; scrollPosition: number }) => {
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
      <Portal>
        {scrollPosition > 250 && (
          <FAB
            icon="chevron-down"
            style={styles.fab}
            onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </Portal>

      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("gtc.title")} />
      <SpacerV height={20} />

      {[...Array(gtcLength).keys()].map((_, i) => (
        <View key={i}>
          {t(`gtc.text.${i}.title`) ? <H3 style={styles.title} text={t(`gtc.text.${i}.title`)} /> : null}
          <Paragraph>{t(`gtc.text.${i}.text`)}</Paragraph>
        </View>
      ))}

      <SpacerV />

      <View style={AppStyles.containerHorizontal}>
        {/* TODO: toast appears on back button click */}
        <ActionLink label={t("action.back")} onPress={() => nav.navigate(Routes.Login)} />
        <View style={AppStyles.mla}>
          <DeFiButton mode="contained" loading={isProcessing} onPress={register}>
            {t("action.accept")}
          </DeFiButton>
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  title: { marginTop: 10 },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default withScroll(withSession(GtcScreen));
