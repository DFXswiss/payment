import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import ChatBot from "../components/util/Chatbot";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";

let params:any;

const ChatBotScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const route = useRoute();
  useAuthGuard(session, [UserRole.Admin]);
  if(!params) params = route.params as any;
  useEffect(() => {
      // reset params
      nav.navigate(Routes.ChatBot, { url: undefined });
    }, []);
    
  return (
      <AppLayout>
        <SpacerV height={20} />
        <SpacerV height={20} />
        <ChatBot src={params?.url} maxWidth={800} />          
        <SpacerV height={20} />
      </AppLayout>
    );
};

export default withSession(ChatBotScreen);
