import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from "react-native";
import { IconButton, Paragraph, Text, TextInput } from 'react-native-paper';
import AnswerList from '../components/chatbot/AnswerList';
import AnswerTextbox from '../components/chatbot/AnswerTextbox';
import Loading from '../components/util/Loading';
import Colors from '../config/Colors';
import Routes from '../config/Routes';
import { DeFiButton } from '../elements/Buttons';
import { SpacerV } from '../elements/Spacers';
import { H2, H3 } from '../elements/Texts';
import { ChatbotAnswer, ChatbotAPIAnswer, ChatbotAuthenticationInfo, ChatbotElement, ChatbotPage } from '../models/ChatbotData';
import { chatbotCreateAnswer, chatbotFeedQuestion, chatbotStart } from '../services/Chatbot';
import { getAuthenticationInfo, nextStep, postSMSCode, requestSMSCode } from '../services/ChatbotService';
import NotificationService from '../services/NotificationService';
import SettingsService from '../services/SettingsService';
import AppStyles from '../styles/AppStyles';

const ChatbotScreen = ({
  sessionUrl
}: {
  sessionUrl: string;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [languageSymbol, setLanguageSymbol] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setLoading] = useState<Boolean>(false);
  const [smsCode, setSMSCode] = useState<string>("");
  const [isSMSCompleted, setSMSCompleted] = useState<Boolean>(false);
  const [authenticationInfo, setAuthenticationInfo] = useState<ChatbotAuthenticationInfo>();
  const [chatbotId, setChatbotId] = useState<string>();
  const [pages, setPages] = useState<ChatbotPage[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(-1); // intentionally start with -1 to use increase in the same way every time
  const [answer, setAnswer] = useState<ChatbotAnswer|undefined>();

  useEffect(() => {
    SettingsService.Language.then(l => { setLanguageSymbol(l?.symbol) })
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

  const onBack = () => {
    console.log("onBack")
    // cancel
    if (pageIndex === 0) {
      nav.navigate(Routes.Home)
    }
    // back
    else {
      setPageIndex(pageIndex - 1)
    }
  }

  const onNext = (pages: ChatbotPage[], isFinished: boolean, shouldTriggerNextStep: boolean = false) => {
    if (isFinished) {
      nav.navigate(Routes.Home)
    } else {
      // check if we need to request next step
      if (pageIndex + 1 < pages.length) {
        setAnswer(undefined)
        setPageIndex(pageIndex + 1)
      } else if (shouldTriggerNextStep && answer !== undefined) {
        requestNextStep(chatbotCreateAnswer(answer.value, answer), chatbotId)
      }
    }
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

  const requestNextStep = (answer: ChatbotAPIAnswer, chatbotId: string | undefined) => {
    nextStep(sessionId ?? "", chatbotId ?? "", answer)
      .then((question) => {
        setLoading(false)
        let [newPages, isFinished] = chatbotFeedQuestion(question)
        let combinedPages = pages.concat(newPages)
        setPages(combinedPages)
        onNext(combinedPages, isFinished)
      })
  }

  return (
    <View style={styles.container}>
      {console.log("re-render chatbot screen with language " + languageSymbol)}
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
            <SpacerV height={20} />
            <DeFiButton mode="contained" onPress={() => { submitSMSCode() }}>
              {"Submit" /* TODO localize this */}
            </DeFiButton>
          </View>
        </View>
      )}
      {/* Chatbot pages screen */}
      {!isLoading && pages && pageIndex >= 0 && pageIndex < pages.length && (
        <View style={styles.container}>
            <View>
            {/* HEADER */}
            {pages[pageIndex].header !== undefined && (
              <H2 text={pages[pageIndex].header ?? ""} />
            )}
            <SpacerV />
            {/* BODY */}
            {pages[pageIndex].body !== undefined && (
              <Text>{pages[pageIndex].body ?? ""}</Text>
            )}
          </View>
          {/* ANSWER PART */}
          {pages[pageIndex].answer !== undefined && (
            <View>
              {/* TEXT INPUT */}
              {pages[pageIndex].answer?.element === ChatbotElement.TEXTBOX && (
                <AnswerTextbox
                  answer={pages[pageIndex].answer}
                  onSubmit={answer => { setAnswer(answer) }}
                />
              )}
              {/* LIST SELECTION */}
              {pages[pageIndex].answer?.element === ChatbotElement.LIST && (
                <AnswerList
                  answer={pages[pageIndex].answer}
                  onSubmit={answer => { setAnswer(answer) }}
                />
              )}
            </View>
          )}
          {/* BUTTON NAVIGATION */}
          <View>
              <DeFiButton mode="contained" onPress={() => { onBack() }}>
                {pageIndex === 0 ? "Cancel" : "Back" /* TODO localize this */}
              </DeFiButton>
              <SpacerV />
              <DeFiButton mode="contained" onPress={() => { onNext(pages, false, true) }}>
                {pageIndex === 0 ? "Start" : "Next" /* TODO localize this */}
              </DeFiButton>
            </View>
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
});

export default ChatbotScreen;