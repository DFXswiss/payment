import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from "react-native";
import { TouchableHighlight } from 'react-native-gesture-handler';
import { IconButton, ProgressBar, Text, TextInput } from 'react-native-paper';
import AnswerDatePicker from '../components/chatbot/AnswerDatePicker';
import AnswerList from '../components/chatbot/AnswerList';
import AnswerTextbox from '../components/chatbot/AnswerTextbox';
import Loading from '../components/util/Loading';
import Colors from '../config/Colors';
import Routes from '../config/Routes';
import { DeFiButton } from '../elements/Buttons';
import { SpacerH, SpacerV } from '../elements/Spacers';
import { H2, H3 } from '../elements/Texts';
import withSettings from '../hocs/withSettings';
import { ChatbotAnswer, ChatbotAPIAnswer, ChatbotAuthenticationInfo, ChatbotElement, ChatbotPage } from '../models/ChatbotData';
import { chatbotCreateAnswer, chatbotFeedQuestion, chatbotStart } from '../services/Chatbot';
import { getAuthenticationInfo, nextStep, postSMSCode, requestSMSCode } from '../services/ChatbotService';
import NotificationService from '../services/NotificationService';
import { AppSettings } from '../services/SettingsService';
import AppStyles from '../styles/AppStyles';

const ChatbotScreen = ({
  settings,
  sessionUrl,
}: {
  settings?: AppSettings;
  sessionUrl: string;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [smsCode, setSMSCode] = useState<string>("");
  const [isSMSCompleted, setSMSCompleted] = useState<boolean>(false);
  const [authenticationInfo, setAuthenticationInfo] = useState<ChatbotAuthenticationInfo>();
  const [chatbotId, setChatbotId] = useState<string>();
  const [pages, setPages] = useState<ChatbotPage[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(-1); // intentionally start with -1 to use increase in the same way every time
  const [answer, setAnswer] = useState<ChatbotAnswer|undefined>();
  const [progress, setProgress] = useState<number>(0);
  const [isFinished, setFinished] = useState<boolean>(false);

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

  const onBack = () => {
    // cancel
    if (pageIndex === 0) {
      nav.navigate(Routes.Home)
    }
    // back
    else {
      let newPageIndex = pageIndex - 1
      setPageIndex(newPageIndex)
      updateProgress(pages, newPageIndex, true)
    }
  }

  const onNext = (pages: ChatbotPage[], isFinished: boolean) => {
    if (isFinished) {
      setFinished(true)
      setTimeout(() => {
        nav.navigate(Routes.Home)
      }, 2000);
      setPageIndex(pageIndex + 1)
      setProgress(1)
    } else {
      // check if we need to request next step
      if (answer !== undefined && answer.shouldTrigger) {
        requestNextStep(chatbotCreateAnswer(answer.value, answer), chatbotId)
      } else if (pageIndex + 1 < pages.length) {
        setAnswer(undefined)
        let newPageIndex = pageIndex + 1
        setPageIndex(newPageIndex)
        updateProgress(pages, newPageIndex)
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
        let [newPages, isFinished] = chatbotFeedQuestion(question, settings?.language)
        let combinedPages = pages.concat(newPages)
        setPages(combinedPages)
        onNext(combinedPages, isFinished)
      })
  }

  const updateProgress = (pages: ChatbotPage[], pageIndex: number, isBack: boolean = false) => {
    if (pageIndex <= 0) {
      setProgress(0)
    }
    // Krysh: there are always around 20 questions. might be more in some cases.
    // current page / max pages
    let newProgress = Math.max(pageIndex, 1) / Math.max(pages.length, 20)
    // on back allow lower progress to previous one
    if (isBack) {
      setProgress(newProgress)
    } 
    // otherwise only higher progress are allowed, to avoid any confusion for users
    else if (newProgress > progress) {
      setProgress(newProgress)
    }
  }

  return (
    <View style={styles.container}>
      {/* Loading */}
      {isLoading && <Loading size="large" />}
      {/* SMS screen */}
      {!isLoading && !isSMSCompleted && (
        <View style={styles.container}>
          <View>
            <H2 text={t("kyc.bot.sms_header")} />
            <SpacerV />
            <View style={[AppStyles.containerHorizontal, styles.header]}>
              <H3 text={t("kyc.bot.sms_code")} />
              <IconButton color={Colors.Primary} icon="reload" onPress={() => { requestSMS(sessionId) }} />
            </View>
            <SpacerV />
            <TextInput value={smsCode} onChangeText={setSMSCode} placeholder={t("kyc.bot.sms_placeholder")} keyboardType="numeric" />
            <SpacerV />
            <Text style={{ color: Colors.Grey }}>{t("kyc.bot.sms_help")}</Text>
            <TouchableHighlight onPress={() => Linking.openURL('mailto:support@kyc.ch')}>
              <Text style={AppStyles.link}>support@kyc.ch</Text>
            </TouchableHighlight>
            <SpacerV height={20} />
            <DeFiButton mode="contained" onPress={() => { submitSMSCode() }}>
              {t("kyc.bot.submit")}
            </DeFiButton>
          </View>
        </View>
      )}
      {/* Chatbot pages screen */}
      {!isLoading && pages && pageIndex >= 0 && pageIndex < pages.length && (
        <View style={styles.container}>
          <View>
            {/* BACK & PROGRESS */}
            <View style={styles.progressHeader}>
              <IconButton color={Colors.Primary} icon="arrow-left" onPress={() => { onBack() }} />
              <SpacerH />
              <View style={styles.progressBar}>
                <ProgressBar color={Colors.Primary} progress={progress} />
              </View>
            </View>
            <SpacerV />
            {/* HEADER */}
            {pages[pageIndex].header !== undefined && (
              <H2 text={pages[pageIndex].header ?? ""} />
            )}
            <SpacerV height={20} />
            {/* BODY */}
            {pages[pageIndex].body !== undefined && (
              <View>
                <Text>{pages[pageIndex].body ?? ""}</Text>
                <SpacerV />
              </View>
            )}
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
                {/* DATE PICKER */}
                {pages[pageIndex].answer?.element === ChatbotElement.DATE && (
                  <AnswerDatePicker
                    answer={pages[pageIndex].answer}
                    onSubmit={answer => { setAnswer(answer)} }
                  />
                )}
              </View>
            )}
          </View>
          {/* BUTTON NAVIGATION */}
          {!isFinished && (
            <View>
              <SpacerV height={20} />
              <DeFiButton mode="contained" onPress={() => { onNext(pages, false) }}>
                {pageIndex === 0 ? t("kyc.bot.start") : t("kyc.bot.next")}
              </DeFiButton>
            </View>
          )}
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
  progressHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
  },
});

export default withSettings(ChatbotScreen);