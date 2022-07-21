import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { getKyc, postFounderCertificate } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import {
  AccountType,
  getKycStatusString,
  getTradeLimit,
  kycCompleted,
  kycInProgress,
  KycResult,
  KycState,
  KycStatus,
  UserDetail,
  UserStatus,
} from "../models/User";
import { pickDocuments, sleep } from "../utils/Utils";
import KycInit from "../components/KycInit";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";
import { DataTable, Dialog, Paragraph, Portal } from "react-native-paper";
import { CompactRow, CompactCell } from "../elements/Tables";
import ButtonContainer from "../components/util/ButtonContainer";
import LimitEdit from "../components/edit/LimitEdit";
import DeFiModal from "../components/util/DeFiModal";
import ChatbotScreen from "./ChatbotScreen";
import AppStyles from "../styles/AppStyles";
import Colors from "../config/Colors";
import UserEdit from "../components/edit/UserEdit";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [isLimitRequest, setIsLimitRequest] = useState(false);
  const [code, setCode] = useState<string>();
  const [kycResult, setKycResult] = useState<KycResult>();
  const [startProcess, setStartProcess] = useState<boolean>(false);
  const [isUserEdit, setUserEdit] = useState<boolean>(false);
  const [user, setUser] = useState<UserDetail>();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const defaultLanguage = { 
    id: 1,
    symbol: "EN",
    name: "English",
    foreignName: "English",
    enable: true,
   }

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (!params?.code) return onLoadFailed();

    setCode(params.code);

    // reset params
    // Krysh: temporarily disabled, and needs adjustments
    // nav.navigate(Routes.Kyc, { code: undefined, autostart: undefined });

    // get KYC info
    getKyc(params?.code)
      .then((result) => {
        updateState(result, params);
        if (params?.autostart) onContinue(result);
      })
      .catch(onLoadFailed);
  }, []);

  const finishChatBot = (nthTry = 13): Promise<void> => {
    setIsLoading(true);
    return getKyc(code)
      .then((result: KycResult) => {
        if (result.kycStatus === KycStatus.CHATBOT || !result.sessionUrl) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => finishChatBot(nthTry - 1));
          }

          throw Error();
        } else {
          updateState(result);
        }
      })
      .catch(() => {
        setIsLoading(false);
        NotificationService.error(t("model.kyc.chatbot_not_finished"));
      });
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const createNewUser = (result: KycResult, params?: any): UserDetail => {
    return {
      kycStatus: result.kycStatus,
      kycState: result.kycState,
      depositLimit: result.depositLimit,
      accountType: AccountType.PERSONAL,
      address: "",
      mail: params?.mail ?? "",
      mobileNumber: params?.phone ?? "",
      language: defaultLanguage,
      usedRef: "",
      status: UserStatus.ACTIVE,
    
      kycHash: params?.code ?? "",
      kycDataComplete: false,
    
      apiKeyCT: "",
      refVolume: 0,
      refCredit: 0,
      paidRefCredit: 0,
      refCount: 0,
      refCountActive: 0,
    }
  }

  const updateState = (result: KycResult, params?: any) => {
    setKycResult(result);
    if (!params.autostart && result.kycState === KycState.NA && result.kycStatus === KycStatus.NA) {
      setUser(createNewUser(result, params))
      setUserEdit(true)
    }
    setIsLoading(false);
  };

  const onContinue = (result: KycResult) => {
    if (kycInProgress(result?.kycStatus)) {
      if (!result?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      // load iframe
      setIsLoading(true);
      setStartProcess(true)
      setTimeout(() => setIsLoading(false), 2000);
    } else if (kycCompleted(result?.kycStatus)) {
      setIsLimitRequest(true);
    }
  };

  const onUserChanged = (newUser: UserDetail) => {
    setUser(newUser);
    setUserEdit(false);
  };

  const doUpload = async () => {
    await uploadFounderCertificate()
  };

  const uploadFounderCertificate = (): Promise<boolean> => {
    return pickDocuments({ type: "public.item", multiple: false })
      .then((files) => {
        setIsFileUploading(true);
        return postFounderCertificate(files, code);
      })
      .then(() => true)
      .catch(() => {
        NotificationService.error(t("feedback.file_error"));
        return false;
      })
      .finally(() => setIsFileUploading(false));
  };

  return (
    <AppLayout preventScrolling={kycResult?.kycStatus === KycStatus.CHATBOT} removeHeaderSpace={kycResult?.kycStatus === KycStatus.CHATBOT}>
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <DeFiModal
        isVisible={isLimitRequest}
        setIsVisible={setIsLimitRequest}
        title={t("model.kyc.increase_limit")}
        style={{ width: 400 }}
      >
        <LimitEdit code={code} onSuccess={() => setIsLimitRequest(false)} />
      </DeFiModal>

      <DeFiModal
        isVisible={isUserEdit}
        setIsVisible={setUserEdit}
        title={t("model.user.edit")}
        style={{ width: 500 }}
      >
        <UserEdit user={user} onUserChanged={onUserChanged} kycDataEdit={true} />
      </DeFiModal>

      {kycResult &&
        (startProcess && kycResult.sessionUrl ? (
          <View style={styles.container}>
            {kycResult.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={kycResult.setupUrl} />
              </View>
            )}
            {kycResult.kycStatus === KycStatus.CHATBOT ? (
              <View style={styles.container}>
                <ChatbotScreen sessionUrl={kycResult.sessionUrl} onFinish={() => { finishChatBot() }} />
              </View>
            ) : (
              <Iframe src={kycResult.sessionUrl} />
            )}
          </View>
        ) : (
          <>
            {user?.accountType === AccountType.BUSINESS && (
              <Portal>
                <Dialog visible={!isUserEdit} style={AppStyles.dialog}>
                  <Dialog.Content>
                    <Paragraph>
                      {t("model.kyc.request_business")}
                    </Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <DeFiButton color={Colors.Grey}>
                      {t("action.abort")}
                    </DeFiButton>
                    <DeFiButton onPress={doUpload} loading={isFileUploading}>
                      {t("action.upload")}
                    </DeFiButton>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            )}
            
            <View>
              {!settings?.isIframe && <SpacerV height={30} />}

              <H2 text={t("model.kyc.status")} />
              <SpacerV />
              <DataTable>
                <CompactRow>
                  <CompactCell>{t("model.kyc.status")}</CompactCell>
                  <CompactCell multiLine>{getKycStatusString(kycResult)}</CompactCell>
                </CompactRow>
                <CompactRow>
                  <CompactCell>{t("model.user.limit")}</CompactCell>
                  <CompactCell>{getTradeLimit(kycResult)}</CompactCell>
                </CompactRow>
              </DataTable>
              <SpacerV />
              {/* TODO: integrate initial limit increase */}
              {kycResult.kycState !== KycState.REVIEW && (
                  <ButtonContainer>
                    <DeFiButton mode="contained" onPress={() => onContinue(kycResult)}>
                      {t(kycCompleted(kycResult.kycStatus) ? "model.kyc.increase_limit" : "action.next")}
                    </DeFiButton>
                  </ButtonContainer>
                )}
            </View>
          </>
        ))}
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  hiddenIframe: {
    height: 0,
    overflow: "hidden",
  },
  chatbotButton: {
    fontSize: 18,
  },
});

export default withSettings(KycScreen);
