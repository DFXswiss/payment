import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Linking, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { IconButton, Text, TextInput } from 'react-native-paper';
import AnswerDatePicker from '../components/chatbot/AnswerDatePicker';
import AnswerList from '../components/chatbot/AnswerList';
import AnswerTextbox from '../components/chatbot/AnswerTextbox';
import Loading from '../components/util/Loading';
import Colors from '../config/Colors';
import Routes from '../config/Routes';
import { DeFiButton } from '../elements/Buttons';
import { SpacerV } from '../elements/Spacers';
import { H2, H3 } from '../elements/Texts';
import withSettings from '../hocs/withSettings';
import { ChatbotAnswer, ChatbotAPIAnswer, ChatbotElement, ChatbotPage, ChatbotStatus } from '../models/ChatbotData';
import { chatbotCreateAnswer, chatbotFeedQuestion, chatbotFillAnswerWithData, chatbotIsEdit, chatbotLocalize, chatbotRestorePages, chatbotShouldSendAnswer, chatbotStart } from '../services/chatbot/ChatbotUtils';
import { getAuthenticationInfo, getStatus, getUpdate, nextStep, postSMSCode, requestSkip, requestSMSCode } from '../services/chatbot/ChatbotService';
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

  const [sessionId, setSessionId] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isRequestNextStep, setRequestingNextStep] = useState<boolean>(false);
  const [smsCode, setSMSCode] = useState<string>("");
  const [isSMSCompleted, setSMSCompleted] = useState<boolean>(false);
  const [chatbotId, setChatbotId] = useState<string>();
  const [pages, setPages] = useState<ChatbotPage[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(-1); // intentionally start with -1 to use increase in the same way every time
  const [answer, setAnswer] = useState<ChatbotAnswer>();
  const [progress, setProgress] = useState<number>(0);
  const [isFinished, setFinished] = useState<boolean>(false);

  const supportEmail = "support@dfx.swiss"
  const {height} = useWindowDimensions()
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (sessionId === undefined) {
      const id = extractSessionId(sessionUrl)
      setSessionId(id)
      getAuthenticationInfo(id)
        .then(() => {
          requestSMS(id)
        })
        .catch(onLoadFailed)
    }
  }, [settings])

  const extractSessionId = (sessionUrl: string): string => {
    const sessionId = sessionUrl.replace("https://services.eurospider.com/chatbot-ui/program/kyc-onboarding/", "")
    return sessionId.split("?")[0]
  }

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  }

  const onChatbotRequestFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    setLoading(false)
    setRequestingNextStep(false)
    if (pages.length === 0) onBack()
  }

  const onBack = () => {
    // cancel
    if (pageIndex === 0) {
      nav.navigate(Routes.Home)
    }
    // back
    else {
      const newPageIndex = pageIndex - 1
      setPageIndex(newPageIndex)
      updateProgress(pages, newPageIndex, true)
      setAnswer(pages[newPageIndex].answer)
      resetScrollView()
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
        const newPageIndex = pageIndex + 1
        setPageIndex(newPageIndex)
        setAnswer(pages[newPageIndex].answer)
        updateProgress(pages, newPageIndex)
        resetScrollView()
      }
    }
  }

  const resetScrollView = () => {
    scrollViewRef.current?.scrollTo({x: 0, y: 0, animated: false})
  }

  const requestSMS = (id?: string) => {
    if (id !== undefined) {
      requestSMSCode(id)
    } else {
      NotificationService.error(t("kyc.bot.error.missing_session_id"))
    }
  }

  const updateSMSCode = (code: string) => {
    setSMSCode(code)
    if (code.length === 4) {
      submitSMSCode(sessionId, code)
      Keyboard.dismiss()
    }
  }

  const submitSMSCode = (id?: string, code?: string) => {
    if (id !== undefined && code !== undefined) {
      setRequestingNextStep(true)
      postSMSCode(id, code)
        .then((id) => {
          if (id === "false") {
            NotificationService.error(t("kyc.bot.error.wrong_sms"))
            // wait a short amount of time to avoid screen flickering due to fast network request
            setTimeout(() => setRequestingNextStep(false), 1000)
          } else {
            setChatbotId(id)
            setSMSCompleted(true)
            requestStart(sessionId, id)
          }
        })
        .catch(onChatbotRequestFailed)
    } else {
      NotificationService.error(t("kyc.bot.error.missing_session_id"))
    }
  }

  const requestStart = (id?: string, chatbotId?: string) => {
    setLoading(true)
    getStatus(id, chatbotId)
      .then((status) => {
        switch (status) {
          case ChatbotStatus.INITIAL:
            // fresh start we need to trigger first question
            requestNextStep(chatbotStart(), undefined, chatbotId)
            break
          case ChatbotStatus.STARTED:
            // already started, need to call update and parse existing pages
            restoreSession(id, chatbotId)
            break
          default:
            requestNextStep(chatbotStart(), undefined, chatbotId)
            break
        }
      })
      .catch(onChatbotRequestFailed)
  }

  const restoreSession = (id?: string, chatbotId?: string, inputPages?: ChatbotPage[], shouldDeactivateLoading: boolean = true): Promise<ChatbotPage[]> => {
    if (inputPages === undefined) {
      inputPages = pages
    }
    return getUpdate(id, chatbotId)
      .then((question) => {
        const restoredPages = chatbotRestorePages(question, inputPages, settings?.language)

        setPages(restoredPages)
        setAnswer(restoredPages[restoredPages.length - 1].answer)
        // jump to last index
        setPageIndex(restoredPages.length - 1)
        if (shouldDeactivateLoading) {
          setLoading(false)
          setRequestingNextStep(false)
        }
        return restoredPages
      })
  }

  const requestEditAnswer = (newValue: string, timestamp: number, chatbotId?: string) => {
    setRequestingNextStep(true)
    setLoading(true)
    requestSkip(timestamp, sessionId, chatbotId)
      .then(() => {
        // request update to restore all pages from KYC spider
        return restoreSession(sessionId, chatbotId, [], false)
          
      })
      .then((newPages) => {
        // given answer is not attached to any page anymore, because of recreation of all pages
        // therefore get recreated pages' last page answer object and fill that with correct values via requestNextStep
        const recreatedAnswer = newPages[newPages.length-1].answer
        if (recreatedAnswer !== undefined) {
          requestNextStep(chatbotCreateAnswer(newValue, recreatedAnswer), recreatedAnswer, chatbotId, newPages)
        }
      })
      .catch(onChatbotRequestFailed)
  }

  const requestNextStep = (apiAnswer: ChatbotAPIAnswer, answer?: ChatbotAnswer, chatbotId?: string, inputPages?: ChatbotPage[]) => {
    setRequestingNextStep(true)
    if (inputPages === undefined) {
      inputPages = pages
    }
    nextStep(sessionId, chatbotId, apiAnswer)
      .then((question) => {
        setRequestingNextStep(false)
        if (answer !== undefined) {
          chatbotFillAnswerWithData(question, answer)
        }
        const [newPages, isFinished, help, autoAnswer] = chatbotFeedQuestion(question, inputPages, settings?.language)
        if (autoAnswer !== undefined) {
          requestNextStep(chatbotCreateAnswer(autoAnswer.value, autoAnswer), autoAnswer, chatbotId, newPages)
        } else if (help !== undefined) {
          NotificationService.error(help)
        } else {
          if (newPages.length > 0) {
            setPages(newPages)
            onNext(newPages, isFinished, answer)
          } else {
            NotificationService.error(t("kyc.bot.error.validation"))
          }
        }
        setLoading(false)
      })
      .catch(onChatbotRequestFailed)
  }

  const updateProgress = (pages: ChatbotPage[], pageIndex: number, isBack: boolean = false) => {
    if (pageIndex <= 0) {
      setProgress(0)
    }
    // Krysh: there are always around 20 questions. might be more in some cases.
    // current page / max pages
    const newProgress = Math.max(pageIndex, 1) / Math.max(pages.length, 20)
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
            <SpacerV height={20} />
            <H2 text={t("kyc.bot.sms_header")} />
            <SpacerV />
            <View style={[AppStyles.containerHorizontal, styles.header]}>
              <H3 text={t("kyc.bot.sms_code")} />
              <IconButton color={Colors.Primary} icon="reload" onPress={() => { requestSMS(sessionId) }} />
            </View>
            <SpacerV />
            <TextInput 
              value={smsCode} 
              onChangeText={updateSMSCode} 
              onSubmitEditing={() => submitSMSCode(sessionId, smsCode)} 
              placeholder={t("kyc.bot.sms_placeholder")} 
              keyboardType="numeric" />
            <SpacerV />
            <Text style={{ color: Colors.Grey }}>{t("kyc.bot.sms_help")}</Text>
            <TouchableOpacity onPress={async () => await Linking.openURL('mailto:' + supportEmail)}>
              <Text style={AppStyles.link}>{supportEmail}</Text>
            </TouchableOpacity>
            <SpacerV height={20} />
            <DeFiButton mode="contained" loading={isRequestNextStep} onPress={() => { submitSMSCode(sessionId, smsCode) }}>
              {t("action.next")}
            </DeFiButton>
          </View>
        </View>
      )}
      {/* Chatbot pages screen */}
      {!isLoading && pages && pageIndex >= 0 && pageIndex < pages.length && (
        <View style={styles.container}>
          {/* BACK & PROGRESS */}
          <View style={styles.progressHeader}>
            <IconButton color={Colors.Primary} icon="arrow-left" onPress={() => { onBack() }} />
            {/* <SpacerH />
            <View style={styles.progressBar}>
              <ProgressBar color={Colors.Primary} progress={progress} />
            </View> */}
          </View>
          <SpacerV />
          <ScrollView ref={scrollViewRef} contentContainerStyle={{flex: 1}}>
            {/* HEADER */}
            {pages[pageIndex].header !== undefined && (
              <>
                {height > 667 ? (
                  <H2 text={ chatbotLocalize(pages[pageIndex].header, settings?.language, pages[pageIndex].answer) } />
                ) : (
                  <H3 text={ chatbotLocalize(pages[pageIndex].header, settings?.language, pages[pageIndex].answer) } />
                )}
              </>
            )}
            <SpacerV height={20} />
            {/* BODY */}
            {pages[pageIndex].body !== undefined && (
              <View>
                <Text>{ chatbotLocalize(pages[pageIndex].body, settings?.language) }</Text>
                {pages[pageIndex].bodyHasSupportLink && (
                  <TouchableOpacity onPress={async () => await Linking.openURL('mailto:' + supportEmail)}>
                    <Text style={AppStyles.link}>{supportEmail}</Text>
                  </TouchableOpacity>
                )}
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
                    language={settings?.language}
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
          </ScrollView>
          {/* BUTTON NAVIGATION */}
          {!isFinished && (
            <View>
              <SpacerV height={20} />
              <DeFiButton mode="contained" loading={isRequestNextStep} onPress={() => { onNext(pages, false) }}>
                {pageIndex === 0 ? t("action.start") : t("action.next")}
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
