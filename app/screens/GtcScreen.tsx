import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import { ApiError } from "../models/ApiDto";
import { Credentials, Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import SessionService from "../services/SessionService";
import StorageService from "../services/StorageService";
import AppStyles from "../styles/AppStyles";
import { Environment } from "../env/Environment";
import { openUrl } from "../utils/Utils";

const gtcLength = require("../i18n/de.json").common.gtc.text.length - 1;

const GtcScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    let url = `${Environment.services}`;
    openUrl(url, false);
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);

  useGuard(() =>
    StorageService.getValue<Credentials>(StorageService.Keys.Credentials).then(
      (credentials) => !(credentials.address && credentials.signature)
    )
  );
  useGuard(() => session && session.isLoggedIn && !isProcessing, [session], Routes.Home);

  const register = () => {
    setIsProcessing(true);

    Promise.all([
      StorageService.getValue<Credentials>(StorageService.Keys.Credentials),
      StorageService.getPrimitive<string>(StorageService.Keys.Ref),
      StorageService.getPrimitive<number>(StorageService.Keys.WalletId),
    ])
      .then(([credentials, ref, walletId]) => SessionService.register(credentials, ref, walletId))
      .then(() =>
        Promise.all([
          StorageService.deleteValue(StorageService.Keys.Credentials),
          StorageService.deleteValue(StorageService.Keys.Ref),
          StorageService.deleteValue(StorageService.Keys.WalletId),
        ])
      )
      .finally(() => setIsProcessing(false))
      .then(() => nav.navigate(Routes.Home))
      .catch((error: ApiError) => {
        let message = t("feedback.register_failed");
        if (error.statusCode == 400) {
          message += ` ${t("session.credentials_invalid")}`;
        }
        NotificationService.error(message);
      });
  };

  return (
    <AppLayout>
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
