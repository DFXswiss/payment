import { useNavigation } from '@react-navigation/native';
import React, { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { DataTable, Paragraph, Text, TextInput } from 'react-native-paper';
import Input from '../../components/form/Input';
import Loading from '../../components/util/Loading';
import Routes from '../../config/Routes';
import { DeFiButton } from '../../elements/Buttons';
import { SpacerH, SpacerV } from '../../elements/Spacers';
import { H2, H3 } from '../../elements/Texts';
import { ChatbotAuthenticationInfo, ChatbotElement } from '../../models/ChatbotData';
import { getAuthenticationInfo, getStatus } from '../../services/ChatbotService';
import NotificationService from '../../services/NotificationService';
import AppStyles from '../../styles/AppStyles';

const ChatbotScreen = ({
  sessionUrl
}: {
  sessionUrl: string;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setLoading] = useState<Boolean>(true);
  const [hasSentSMS, setHasSentSMS] = useState<Boolean>(false);
  const [authenticationInfo, setAuthenticationInfo] = useState<ChatbotAuthenticationInfo>();

  useEffect(() => {
    let id = extractSessionId(sessionUrl)
    setSessionId(id)
    getAuthenticationInfo(id)
      .then(setAuthenticationInfo)
      .then(() => {
        setLoading(false)
        sendSMS()
      })
      .catch(onLoadFailed)
  }, []);

  const extractSessionId = (sessionUrl: string): string => {
    let sessionId = sessionUrl.replace("https://services.eurospider.com/chatbot-ui/program/kyc-onboarding/", "")
    return sessionId.split("?")[0]
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const sendSMS = () => {
    console.log("should send SMS here")
    setTimeout(() => {
      setHasSentSMS(true)
    }, 1000);
  }

  interface ChatbotMessage {
    id: number,
    condition: Boolean,
    label: string | [string] | undefined,
    element: ChatbotElement,
  };

  const chatbotMessageData = (authenticationInfo: ChatbotAuthenticationInfo | undefined, hasSentSMS: Boolean) => [
    { id: 0, condition: Boolean(authenticationInfo?.secretTitle.en), label: authenticationInfo?.secretTitle.en, element: ChatbotElement.HEADER },
    { id: 1, condition: Boolean(authenticationInfo?.secretLabel.en), label: authenticationInfo?.secretLabel.en, element: ChatbotElement.TEXT },
    { id: 2, condition: !hasSentSMS, element: ChatbotElement.LOADING },
    { id: 3, condition: hasSentSMS, label: ["Your SMS code", "Send"], element: ChatbotElement.TEXTBOX_BUTTON },
  ];

  return (
    <View style={styles.container}>
      {isLoading && <Loading size="large" />}
      {!isLoading && authenticationInfo && (
        <View>
          <DataTable>
            {chatbotMessageData(authenticationInfo, hasSentSMS).map(
              (d) =>
                d.condition && (
                  <View key={d.id} >
                    {d.element === ChatbotElement.HEADER && typeof d.label === 'string' && (
                      <H2 text={d.label} />
                    )}
                    {d.element === ChatbotElement.TEXT && typeof d.label === 'string' && (
                      <H3 text={d.label} />
                    )}
                    {d.element === ChatbotElement.LOADING && (
                      <Loading size="small" />
                    )}
                    {d.element === ChatbotElement.TEXTBOX_BUTTON && typeof d.label === 'object' && (
                      <View style={AppStyles.containerHorizontal}>
                        <TextInput style={{height: 50}} placeholder={d.label[0]} keyboardType="numeric" />
                        <SpacerH />
                        <DeFiButton mode="contained" onPress={() => { console.log("button onPress todo") }}>
                          {d.label[1]}
                        </DeFiButton>
                      </View>
                    )}
                    <SpacerV />
                  </View>
                )
            )}
          </DataTable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatbotScreen;