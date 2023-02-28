import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { getKyc, postFounderCertificate, postKyc } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import {
  AccountType,
  getKycStatusString,
  getTradeLimit,
  kycCompleted,
  kycInProgress,
  KycInfo,
  KycState,
  KycStatus,
  kycNotStarted,
  kycInReview,
} from "../models/User";
import { openUrl, pickDocuments, sleep } from "../utils/Utils";
import KycInit from "../components/KycInit";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import SettingsService, { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";
import { DataTable, Dialog, Paragraph, Portal } from "react-native-paper";
import { CompactRow, CompactCell } from "../elements/Tables";
import ButtonContainer from "../components/util/ButtonContainer";
import LimitEdit from "../components/edit/LimitEdit";
import DeFiModal from "../components/util/DeFiModal";
import ChatbotScreen from "./ChatbotScreen";
import AppStyles from "../styles/AppStyles";
import Colors from "../config/Colors";
import { KycData } from "../models/KycData";
import KycDataEdit from "../components/edit/KycDataEdit";
import { ApiError } from "../models/ApiDto";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  // data
  const [kycInfo, setKycInfo] = useState<KycInfo>();
  const [kycData, setKycData] = useState<KycData>();
  const [inputParams, setInputParams] = useState<any>();

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLimitRequest, setIsLimitRequest] = useState(false);
  const [isKycInProgress, setIsKycInProgress] = useState<boolean>(false);
  const [isKycDataEdit, setKycDataEdit] = useState<boolean>(false);
  const [showsKycStartDialog, setShowsKycStartDialog] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [showsLinkInstructions, setShowsLinkInstructions] = useState(false);

  useEffect(() => {
    // store and reset params
    const params = route.params as any;
    SettingsService.updateSettings({ headless: params?.headless });
    if (!params?.code) return onLoadFailed();

    setInputParams(params);
    nav.navigate(Routes.Kyc, {
      code: undefined,
      autostart: undefined,
      phone: undefined,
      mail: undefined,
      headless: undefined,
    });

    // get KYC info
    getKyc(params?.code)
      .then((result) => {
        setKycInfo(result);
        setIsLoading(false);

        if (params?.autostart) continueKyc(result, params);
      })
      .catch(onLoadFailed);
  }, []);

  const continueAllowed = (info?: KycInfo): boolean =>
    ![KycState.REVIEW, KycState.FAILED].includes(info?.kycState ?? KycState.NA);

  const continueKyc = (info?: KycInfo, params?: any) => {
    if (!continueAllowed(info)) return;

    if (!info?.kycDataComplete) {
      setKycData({ accountType: AccountType.PERSONAL, ...params });
      setKycDataEdit(true);
    } else if (kycNotStarted(info?.kycStatus)) {
      setShowsKycStartDialog(true);
    } else if (kycInProgress(info?.kycStatus)) {
      if (!info?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      setIsKycInProgress(true);

      if (info?.kycStatus !== KycStatus.CHATBOT) {
        startIdent();
      }
    } else if (kycCompleted(info?.kycStatus)) {
      setIsLimitRequest(true);
    }
  };

  const startIdent = () => {
    // load iframe
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);

    // poll for completion
    setInterval(() => {
      getKyc(kycInfo?.kycHash).then((info) => {
        if (kycInReview(info.kycStatus)) setIsKycInProgress(false);
        setKycInfo(info);
      });
    }, 1000);
  };

  const startKyc = async () => {
    if (hasToUploadFounderDocument()) {
      if (!(await uploadFounderCertificate())) return;
    }

    setShowsKycStartDialog(false);

    // start KYC
    setIsLoading(true);
    postKyc(kycInfo?.kycHash)
      .then((result) => {
        setKycInfo(result);
        continueKyc(result);
      })
      .catch((error: ApiError) => {
        if (error.statusCode === 409) {
          setShowsLinkInstructions(true);
        } else {
          onLoadFailed();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onChatBotFinished = (nthTry = 13): Promise<void> => {
    setIsLoading(true);
    return getKyc(kycInfo?.kycHash)
      .then((info: KycInfo) => {
        if (info.kycStatus === KycStatus.CHATBOT || !info.sessionUrl) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => onChatBotFinished(nthTry - 1));
          }

          throw Error();
        } else {
          setKycInfo(info);
          setIsLoading(false);

          continueKyc(info);
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

  const onKycDataSubmit = (newKycData: KycData, info: KycInfo) => {
    setKycInfo(info);
    setKycData(newKycData);

    setKycDataEdit(false);

    continueKyc(info);
  };

  const uploadFounderCertificate = (): Promise<boolean> => {
    return pickDocuments({ type: "public.item", multiple: false })
      .then((files) => {
        setIsFileUploading(true);
        return postFounderCertificate(files, kycInfo?.kycHash);
      })
      .then(() => true)
      .catch(() => {
        NotificationService.error(t("feedback.file_error"));
        return false;
      })
      .finally(() => setIsFileUploading(false));
  };

  const onComplete = () => openUrl((route.params as any)?.redirect_uri ?? "https://dfx.swiss", false);

  const continueLabel = (): string => {
    if (kycCompleted(kycInfo?.kycStatus)) return "model.kyc.increase_limit";
    else if (kycNotStarted(kycInfo?.kycStatus)) return "action.start";
    else return "action.next";
  };

  const hasToUploadFounderDocument = () => kycInfo?.accountType === AccountType.BUSINESS;

  return (
    <AppLayout
      preventScrolling={kycInfo?.kycStatus === KycStatus.CHATBOT}
      removeHeaderSpace={kycInfo?.kycStatus === KycStatus.CHATBOT}
    >
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <DeFiModal
        isVisible={isLimitRequest}
        setIsVisible={setIsLimitRequest}
        title={t("model.kyc.increase_limit")}
        style={{ width: 400 }}
      >
        <LimitEdit code={kycInfo?.kycHash} onSuccess={() => setIsLimitRequest(false)} />
      </DeFiModal>

      {kycInfo?.kycHash && (
        <DeFiModal
          isVisible={isKycDataEdit}
          setIsVisible={setKycDataEdit}
          title={t("model.user.edit")}
          style={{ width: 500 }}
        >
          <KycDataEdit code={kycInfo.kycHash} kycData={kycData} kycInfo={kycInfo} onChanged={onKycDataSubmit} />
        </DeFiModal>
      )}

      {kycInfo &&
        (isKycInProgress && kycInfo.sessionUrl ? (
          <View style={styles.container}>
            {kycInfo.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={kycInfo.setupUrl} />
              </View>
            )}
            {kycInfo.kycStatus === KycStatus.CHATBOT ? (
              <View style={styles.container}>
                <ChatbotScreen sessionUrl={kycInfo.sessionUrl} onFinish={onChatBotFinished} />
              </View>
            ) : (
              <Iframe src={kycInfo.sessionUrl} />
            )}
          </View>
        ) : kycInReview(kycInfo?.kycStatus) ? (
          <>
            <View>
              {!settings?.headless && <SpacerV height={30} />}

              <H2 text={t("model.kyc.review_title")} />
              <SpacerV />

              <Paragraph>{t(`model.kyc.review_text`)}</Paragraph>

              <SpacerV />
              <ButtonContainer>
                <DeFiButton mode="contained" onPress={onComplete}>
                  {t("action.ok")}
                </DeFiButton>
              </ButtonContainer>
            </View>
          </>
        ) : (
          <>
            <Portal>
              <Dialog
                visible={showsKycStartDialog}
                onDismiss={() => setShowsKycStartDialog(false)}
                style={AppStyles.dialog}
              >
                <Dialog.Content>
                  <Paragraph>
                    {t(hasToUploadFounderDocument() ? "model.kyc.request_business" : "model.kyc.request")}
                  </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <DeFiButton onPress={() => setShowsKycStartDialog(false)} color={Colors.Grey}>
                    {t("action.abort")}
                  </DeFiButton>
                  <DeFiButton onPress={startKyc} loading={isFileUploading}>
                    {t(hasToUploadFounderDocument() ? "action.upload" : "action.yes")}
                  </DeFiButton>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog
                visible={showsLinkInstructions}
                onDismiss={() => setShowsLinkInstructions(false)}
                style={AppStyles.dialog}
              >
                <Dialog.Content>
                  <Paragraph>{t("link.instructions")}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <DeFiButton onPress={() => setShowsLinkInstructions(false)}>{t("action.ok")}</DeFiButton>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <View>
              {!settings?.headless && <SpacerV height={30} />}

              <H2 text={t("model.kyc.title")} />
              <SpacerV />
              <DataTable>
                {!kycNotStarted(kycInfo.kycStatus) && (
                  <CompactRow>
                    <CompactCell>{t("model.kyc.status")}</CompactCell>
                    <CompactCell multiLine>{getKycStatusString(kycInfo)}</CompactCell>
                  </CompactRow>
                )}
                <CompactRow>
                  <CompactCell>{t("model.user.limit")}</CompactCell>
                  <CompactCell>{getTradeLimit(kycInfo)}</CompactCell>
                </CompactRow>
                {kycInfo.blankedMail && (
                  <CompactRow>
                    <CompactCell>{t("model.user.mail")}</CompactCell>
                    <CompactCell>{kycInfo.blankedMail}</CompactCell>
                  </CompactRow>
                )}
                {kycInfo.blankedPhone && (
                  <CompactRow>
                    <CompactCell>{t("model.user.mobile_number")}</CompactCell>
                    <CompactCell>{kycInfo.blankedPhone}</CompactCell>
                  </CompactRow>
                )}
              </DataTable>
              <SpacerV />
              {continueAllowed(kycInfo) && (
                <ButtonContainer>
                  <DeFiButton mode="contained" onPress={() => continueKyc(kycInfo, inputParams)}>
                    {t(continueLabel())}
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
