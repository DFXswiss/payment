import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from "react-native";
import { DataTable, IconButton, Text, TextInput } from 'react-native-paper';
import AnswerText from '../components/chatbot/AnswerText';
import Loading from '../components/util/Loading';
import Colors from '../config/Colors';
import Routes from '../config/Routes';
import { DeFiButton } from '../elements/Buttons';
import { SpacerH, SpacerV } from '../elements/Spacers';
import { H2, H3 } from '../elements/Texts';
import { ChatbotAnswer, ChatbotAuthenticationInfo, ChatbotElement, ChatbotMessage, ChatbotMessageType } from '../models/ChatbotData';
import { chatbotCreateAnswer, chatbotFeedQuestion, chatbotStart } from '../services/Chatbot';
import { getAuthenticationInfo, nextStep, postSMSCode, requestSMSCode } from '../services/ChatbotService';
import NotificationService from '../services/NotificationService';
import AppStyles from '../styles/AppStyles';

const ChatbotScreen = ({
  sessionUrl
}: {
  sessionUrl: string;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setLoading] = useState<Boolean>(false);
  const [smsCode, setSMSCode] = useState<string>("");
  const [isSMSCompleted, setSMSCompleted] = useState<Boolean>(false);
  const [authenticationInfo, setAuthenticationInfo] = useState<ChatbotAuthenticationInfo>();
  const [chatbotId, setChatbotId] = useState<string>();
  const [messages, setMessages] = useState<[ChatbotMessage]>();

  useEffect(() => {
    let id = extractSessionId(sessionUrl)
    setSessionId(id)
    getAuthenticationInfo(id)
      .then(setAuthenticationInfo)
      .then(() => {
        requestSMS(id)
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

  const onSMSChallengeFailed = () => {
    console.log("TODO show error message")
  }

  const requestSMS = (id: string | undefined) => {
    if (id !== undefined) {
      requestSMSCode(id)
        .then(() => { console.log("requested SMS code") })
    } else {
      console.error("sessionId not set")
    }
  }

  const submitSMSCode = () => {
    setLoading(true)
    postSMSCode(smsCode)
      .then((id) => {
        setChatbotId(id)
        setSMSCompleted(true)
        requestNextStep(chatbotStart(), id)
      })
  }

  const requestNextStep = (answer: ChatbotAnswer, chatbotId: string | undefined) => {
    nextStep(sessionId ?? "", chatbotId ?? "", answer)
      .then((question) => {
        setLoading(false)
        setMessages(chatbotFeedQuestion(question, messages))
      })
      // TODO maybe use a different catch to avoid getting thrown back to home screen all the time
      .catch(onLoadFailed)
  }

  return (
    <View style={styles.container}>
      {/* Loading */}
      {isLoading && <Loading size="large" />}
      {/* SMS screen */}
      {!isLoading && !isSMSCompleted && (
        <View style={styles.container}>
          <View>
            <H2 text="Please enter the SMS code from KYC:" />
            <SpacerV />
            <View style={[AppStyles.containerHorizontal, styles.header]}>
              <H3 text="Enter SMS code" />
              <IconButton color={Colors.Primary} icon="reload" onPress={() => { requestSMS(sessionId) }} />
            </View>
            <SpacerV />
            <TextInput value={smsCode} onChangeText={setSMSCode} placeholder="Your SMS code" keyboardType="numeric" />
            <SpacerV />
            <Text style={{ color: Colors.Grey }}>{"If you did not receive an SMS Code, please contact "}</Text>
            {/* TODO link to support@kyc.ch */}
          </View>
          <DeFiButton mode="contained" onPress={() => { submitSMSCode() }}>
            {"Submit"}
          </DeFiButton>
        </View>
      )}
      {/* Chatbot messages screen */}
      {!isLoading && messages && (
        <View>
          <DataTable>
            {messages.map(
              (message) =>
                <View key={message.id} >
                  {/* GENERAL PART */}
                  {message.element === ChatbotElement.LOADING && (
                    <Loading size="small" />
                  )}
                  {/* QUESTION PART */}
                  {message.type === ChatbotMessageType.QUESTION && message.element === ChatbotElement.TEXT && message.label && (
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionText}>{message.label}</Text>
                    </View>
                  )}
                  {/* ANSWER PART */}
                  {message.type === ChatbotMessageType.ANSWER && message.element === ChatbotElement.TEXTBOX && (
                    <AnswerText onSubmit={value => { requestNextStep(chatbotCreateAnswer(value, messages), chatbotId) }} />
                  )}
                  {/* {message.element === ChatbotElement.TEXTBOX_BUTTON && typeof message.label === 'object' && (
                    <View style={AppStyles.containerHorizontal}>
                      <TextInput style={{ height: 50 }} placeholder={message.label[0]} keyboardType="numeric" />
                      <SpacerH />
                      <DeFiButton mode="contained" onPress={() => { console.log("button onPress todo") }}>
                        {message.label[1]}
                      </DeFiButton>
                    </View>
                  )} */}
                  <SpacerV height={5} />
                </View>
            )}
          </DataTable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  header: {
    justifyContent: 'space-between',
  },
  questionContainer: {
    width: '66%',
    backgroundColor: Colors.LightBlue,
  },
  questionText: {
    padding: '10px',
  },
});

export default ChatbotScreen;