import { useNavigation } from '@react-navigation/native';
import React, { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from "react-native";
import { Paragraph } from 'react-native-paper';
import Loading from '../../components/util/Loading';
import Routes from '../../config/Routes';
import { ChatbotAuthenticationInfo } from '../../models/ChatbotData';
import { getAuthenticationInfo, getStatus } from '../../services/ChatbotService';
import NotificationService from '../../services/NotificationService';

const ChatbotScreen = ({
  sessionUrl
}: {
  sessionUrl: string;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [authenticationInfo, setAuthenticationInfo] = useState<ChatbotAuthenticationInfo>();

  const [shouldShowAuthenticationInfo, setShouldShowAuthenticationInfo] = useState<boolean>(false);

  useEffect(() => {
    let id = extractSessionId(sessionUrl)
    setSessionId(id)
    getAuthenticationInfo(id)
      .then(updateAuthenticationInfo)
      .catch(onLoadFailed)
  }, []);

  const extractSessionId = (sessionUrl: string): string => {
    let sessionId = sessionUrl.replace("https://services.eurospider.com/chatbot-ui/program/kyc-onboarding/", "")
    return sessionId.split("?")[0]
  }

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const updateAuthenticationInfo = (result: ChatbotAuthenticationInfo) => {
    setAuthenticationInfo(result)
    setShouldShowAuthenticationInfo(true)
  }

  const currentView = (): ReactNode => {
    if (shouldShowAuthenticationInfo) {
      return <Paragraph>{authenticationInfo?.secretTitle.en}</Paragraph>
    }
    return <Loading size="large" />
  }

  return (
    <View style={styles.container}>
      { currentView() }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatbotScreen;