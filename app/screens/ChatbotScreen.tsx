import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from "react-native";
import { TouchableHighlight } from 'react-native-gesture-handler';
import { IconButton, Text, TextInput } from 'react-native-paper';
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
import { ChatbotAnswer, ChatbotAPIAnswer, ChatbotAPIQuestion, ChatbotElement, ChatbotPage, ChatbotStatus } from '../models/ChatbotData';
import { chatbotCreateAnswer, chatbotFeedQuestion, chatbotFillAnswerWithData, chatbotIsEdit, chatbotRestorePages, chatbotShouldSendAnswer, chatbotStart } from '../services/Chatbot';
import { getAuthenticationInfo, getStatus, getUpdate, nextStep, postSMSCode, requestSkip, requestSMSCode } from '../services/ChatbotService';
import NotificationService from '../services/NotificationService';
import { AppSettings } from '../services/SettingsService';
import AppStyles from '../styles/AppStyles';

const ChatbotScreen = ({
  settings,
  sessionUrl,
  onFinish
}: {
  settings?: AppSettings;
  sessionUrl: string;
  onFinish: () => void;
}) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isRequestNextStep, setRequestingNextStep] = useState<boolean>(false);
  const [smsCode, setSMSCode] = useState<string>("");
  const [isSMSCompleted, setSMSCompleted] = useState<boolean>(false);
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
      .then(() => {
        requestSMS(id)
      })
      .catch(onLoadFailed)
  }, [])

  const extractSessionId = (sessionUrl: string): string => {
    let sessionId = sessionUrl.replace("https://services.eurospider.com/chatbot-ui/program/kyc-onboarding/", "")
    return sessionId.split("?")[0]
  }

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
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
      setAnswer(pages[newPageIndex].answer)
    }
  }

  const onNext = (pages: ChatbotPage[], isFinished: boolean, inputAnswer?: ChatbotAnswer) => {
    if (inputAnswer === undefined) {
      inputAnswer = answer
    }
    if (isFinished) {
      setFinished(true)
      onFinish()
      setPageIndex(pageIndex + 1)
      setProgress(1)
    } else {
      // check if we need to request next step
      if (inputAnswer !== undefined && chatbotShouldSendAnswer(inputAnswer)) {
        if (chatbotIsEdit(inputAnswer)) {
          requestEditAnswer(inputAnswer.value, inputAnswer.timestamp, chatbotId)
        } else {
          requestNextStep(chatbotCreateAnswer(inputAnswer.value, inputAnswer), answer, chatbotId)
        }
      } else if (pageIndex + 1 < pages.length) {
        let newPageIndex = pageIndex + 1
        setPageIndex(newPageIndex)
        setAnswer(pages[newPageIndex].answer)
        updateProgress(pages, newPageIndex)
      }
    }
  }

  const requestSMS = (id?: string) => {
    if (id !== undefined) {
      requestSMSCode(id)
    } else {
      NotificationService.error(t("kyc.bot.error.missing_session_id"))
    }
  }

  const submitSMSCode = (id?: string) => {
    if (id !== undefined) {
      setLoading(true)
      postSMSCode(id, smsCode)
        .then((id) => {
          if (id === "false") {
            nav.navigate(Routes.Home)
          } else {
            setChatbotId(id)
            setSMSCompleted(true)
            requestStatus(sessionId, id)
          }
        })
    } else {
      NotificationService.error(t("kyc.bot.error.missing_session_id"))
    }
  }

  const requestStatus = (id?: string, chatbotId?: string) => {
    getStatus(id, chatbotId)
      .then((status) => {
        switch (status) {
          case ChatbotStatus.INITIAL:
            // fresh start we need to trigger first question
            requestNextStep(chatbotStart(), undefined, chatbotId)
            break
          case ChatbotStatus.STARTED:
            // already started, need to call update and parse existing pages
            requestUpdate(id, chatbotId)
            break
        }
      })
  }

  const requestUpdate = (id?: string, chatbotId?: string, inputPages?: ChatbotPage[], shouldDoUpdates: boolean = true): Promise<ChatbotPage[]> => {
    console.log("requestUpdate: inputPages")
    console.log(inputPages)
    if (inputPages === undefined) {
      inputPages = pages
    }
    return getUpdate(id, chatbotId)
      .then((question) => {
        let restoredPages = chatbotRestorePages(question, settings?.language)
        let combinedPages = inputPages?.concat(restoredPages) ?? restoredPages
        if (shouldDoUpdates) {
          setPages(combinedPages)
          setAnswer(combinedPages.slice(-1)[0].answer)
          // jump to last index
          setPageIndex(combinedPages.length - 1)
          setLoading(false)
        }
        return combinedPages
      })
  }

  const requestEditAnswer = (newValue: string, timestamp: number, chatbotId?: string) => {
    setRequestingNextStep(true)
    setLoading(true)
    requestSkip(timestamp, sessionId, chatbotId)
      .then(() => {
        // request update to restore all pages from KYC spider
        requestUpdate(sessionId, chatbotId, [], false)
          .then((newPages) => {
            // given answer is not attached to any page anymore, because of recreation of all pages
            // therefore get recreated pages' last page answer object and fill that with correct values via requestNextStep
            let recreatedAnswer = newPages[newPages.length-1].answer
            if (recreatedAnswer !== undefined) {
              requestNextStep(chatbotCreateAnswer(newValue, recreatedAnswer), recreatedAnswer, chatbotId, newPages)
            }
          })
      })
  }

  const requestNextStep = (apiAnswer: ChatbotAPIAnswer, answer?: ChatbotAnswer, chatbotId?: string, inputPages?: ChatbotPage[]): Promise<ChatbotPage[]> => {
    setRequestingNextStep(true)
    console.log("requestNextStep: inputPages")
    console.log(inputPages)
    if (inputPages === undefined) {
      inputPages = pages
    }
    return nextStep(sessionId, chatbotId, apiAnswer)
      .then((question) => {
        setRequestingNextStep(false)
        if (answer !== undefined) {
          console.log("chatbotFillAnswerWithData ")
          console.log(question.items)
          chatbotFillAnswerWithData(question, answer)
        }
        let [newPages, isFinished, help] = chatbotFeedQuestion(question, settings?.language)
        console.log("newPages")
        console.log(newPages)
        let combinedPages: ChatbotPage[] = []
        if (help !== undefined) {
          NotificationService.error(help)
        } else {
          if (newPages.length > 0) {
            let combinedPages = inputPages?.concat(newPages) ?? newPages
            setPages(combinedPages)
            onNext(combinedPages, isFinished, answer)
          } else {
            NotificationService.error(t("kyc.bot.error.validation"))
          }
        }
        setLoading(false)
        return combinedPages
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
            <TextInput value={smsCode} onChangeText={setSMSCode} onSubmitEditing={() => { submitSMSCode(sessionId) }} placeholder={t("kyc.bot.sms_placeholder")} keyboardType="numeric" />
            <SpacerV />
            <Text style={{ color: Colors.Grey }}>{t("kyc.bot.sms_help")}</Text>
            <TouchableHighlight onPress={() => Linking.openURL('mailto:support@kyc.ch')}>
              <Text style={AppStyles.link}>support@kyc.ch</Text>
            </TouchableHighlight>
            <SpacerV height={20} />
            <DeFiButton mode="contained" onPress={() => { submitSMSCode(sessionId) }}>
              {t("kyc.bot.submit")}
            </DeFiButton>
          </View>
        </View>
      )}
      {/* Chatbot pages screen */}
      {!isLoading && pages && pageIndex >= 0 && pageIndex < pages.length && (
        <View style={styles.container}>
          <View style={{flex: 1}}>
            {/* BACK & PROGRESS */}
            <View style={styles.progressHeader}>
              <IconButton color={Colors.Primary} icon="arrow-left" onPress={() => { onBack() }} />
              {/* <SpacerH />
              <View style={styles.progressBar}>
                <ProgressBar color={Colors.Primary} progress={progress} />
              </View> */}
            </View>
            <SpacerV />
            {/* HEADER */}
            {
              console.log(
                "---------------------" + "\n" +
                "number of pages: " + pages.length + "\n" +
                "page index: " + pageIndex + "\n" +
                "header: " + pages[pageIndex].header + "\n" +
                "answer: " + pages[pageIndex].answer?.previousSentValue + "\n" +
                "---------------------"
              )
            }
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
              <View style={{flex: 1}}>
                {/* TEXT INPUT */}
                {pages[pageIndex].answer?.element === ChatbotElement.TEXTBOX && (
                  <AnswerTextbox
                    answer={pages[pageIndex].answer}
                    onSubmit={(answer, shouldTriggerNext) => { 
                      setAnswer(answer) 
                      if (shouldTriggerNext) {
                        onNext(pages, false)
                      }
                    }}
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
                    onSubmit={(answer, shouldTriggerNext) => { 
                      setAnswer(answer) 
                      if (shouldTriggerNext) {
                        onNext(pages, false)
                      }
                    }}
                  />
                )}
              </View>
            )}
          </View>
          {/* BUTTON NAVIGATION */}
          {!isFinished && (
            <View>
              <SpacerV height={20} />
              <DeFiButton mode="contained" loading={isRequestNextStep} onPress={() => { onNext(pages, false) }}>
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
    flexGrow: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
  },
});

export default withSettings(ChatbotScreen);