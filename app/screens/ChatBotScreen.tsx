import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import AppStyles from "../styles/AppStyles";
import * as DocumentPicker from "expo-document-picker";
import NotificationService from "../services/NotificationService";
import { StyleSheet, View } from "react-native";
import { useDevice } from "../hooks/useDevice";
import { postSepaFiles } from "../services/ApiService";
import ChatBot from "../components/util/Chatbot";

const ChatBotScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();

  useAuthGuard(session, [UserRole.Admin]);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("model.kyc.chatbot_title")} />

      <SpacerV height={20} />
      <ChatBot src="https://services.eurospider.com/chatbot-ui/program/kyc-onboarding/olczReWlsdMHzjtC4S7bD8EvfU33d2uXIDw6go1uX92msRdP0Tg93wXDvjMxACZn?st=tan&l=en&key=NTZ-RoMO" maxWidth={800} />          
      <SpacerV height={20} />

    </AppLayout>
  );
};

const styles = StyleSheet.create({
  large: {
    justifyContent: "space-between",
  },
});

export default withSession(ChatBotScreen);
