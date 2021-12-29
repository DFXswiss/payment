import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { View } from "react-native";
import { Session } from "../services/AuthService";
import ChatBot from "../components/util/Chatbot";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import ButtonContainer from "../components/util/ButtonContainer";
import { DeFiButton } from "../elements/Buttons";
import { useTranslation } from "react-i18next";
import AppStyles from "../styles/AppStyles";

let params:any;

const ChatBotScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
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
        <View style={AppStyles.alignCenter}>
        <ButtonContainer>
                  <DeFiButton mode="contained" link onPress={() => nav.navigate(Routes.Home)}>
                    {t("model.kyc.leave")}
                  </DeFiButton>
        </ButtonContainer>
        </View>
      </AppLayout>
    );
};



export default withSession(ChatBotScreen);


