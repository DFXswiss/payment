import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import ButtonContainer from "../components/util/ButtonContainer";
import { DeFiButton } from "../elements/Buttons";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const ChatBotScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  useAuthGuard(session);

  useEffect(() => {
    const params = route.params as any;
    setUrl(params?.url);

    // reset params
    nav.navigate(Routes.ChatBot, { url: undefined });
  }, []);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <View style={styles.container}>
        <Iframe src={url} />
        <SpacerV height={20} />
        <ButtonContainer>
          <DeFiButton mode="contained" onPress={() => nav.navigate(Routes.Home)}>
            {t("model.kyc.leave")}
          </DeFiButton>
        </ButtonContainer>
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

export default withSession(ChatBotScreen);
