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
import { KycData } from "../models/KycData";
import KycDataEdit from "../components/edit/KycDataEdit";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [isLimitRequest, setIsLimitRequest] = useState(false);
  const [code, setCode] = useState<string>();
  const [kycInfo, setKycInfo] = useState<KycInfo>();
  const [startProcess, setStartProcess] = useState<boolean>(false);
  const [kycData, setKycData] = useState<KycData>();
  const [isKycDataEdit, setKycDataEdit] = useState<boolean>(false);
  const [showsUploadDialog, setShowsUploadDialog] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [hasUploadedFile, setHasUploadFile] = useState(false);
  const [isAutostart, setIsAutostart] = useState(false);

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (!params?.code) return onLoadFailed();

    setCode(params.code);
    setIsAutostart(params.autostart);

    // reset params
    // Krysh: temporarily disabled, and needs adjustments
    // nav.navigate(Routes.Kyc, { code: undefined, autostart: undefined });

    // get KYC info
    getKyc(params?.code)
      .then((result) => {
        updateState(result, params);
        if (params?.autostart && result.kycStatus !== KycStatus.NA) onContinue(result);
        else if (params?.autostart && shouldStart(result)) requestStart(params?.code);
      })
      .catch(onLoadFailed);
  }, []);

  const shouldStart = (info: KycInfo): boolean => {
    return info.kycDataComplete && info.kycStatus === KycStatus.NA;
  };

  const requestStart = (kycCode?: string) => {
    setIsLoading(true);
    postKyc(kycCode).then((result) => {
      updateState(result);
      if (isAutostart || kycInProgress(result.kycStatus)) onContinue(result);
    });
  };

  const finishChatBot = (nthTry = 13): Promise<void> => {
    setIsLoading(true);
    return getKyc(code)
      .then((info: KycInfo) => {
        if (info.kycStatus === KycStatus.CHATBOT || !info.sessionUrl) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => finishChatBot(nthTry - 1));
          }

          throw Error();
        } else {
          updateState(info);
        }
      })
      .catch(() => {
        setIsLoading(false);
        NotificationService.error(t("model.kyc.chatbot_not_finished"));
      });
  };

  const onLoadFailed = () => {
    console.log("onLoadFailed is called");
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const updateState = (info: KycInfo, params?: any) => {
    setKycInfo(info);
    if (!info.kycDataComplete) {
      setKycData({ accountType: AccountType.PERSONAL, ...params });
      setKycDataEdit(true);
    }
    setIsLoading(false);
  };

  const onContinue = (info: KycInfo) => {
    if (!info.kycDataComplete) {
      setKycDataEdit(true);
    } else if (kycInProgress(info?.kycStatus)) {
      if (!info?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      // load iframe
      setIsLoading(true);
      setStartProcess(true);
      setTimeout(() => setIsLoading(false), 2000);
    } else if (kycCompleted(info?.kycStatus)) {
      setIsLimitRequest(true);
    } else if (shouldStart(info)) {
      requestStart(code);
    }
  };

  const onChanged = (newKycData: KycData, info: KycInfo) => {
    setKycData(newKycData);
    setKycDataEdit(false);
    setShowsUploadDialog(newKycData.accountType === AccountType.BUSINESS);
    console.log("onChange: should autostart?", isAutostart);

    updateState(info);
    if (isAutostart) onContinue(info);
  };

  const doUpload = async () => {
    await uploadFounderCertificate();
  };

  const uploadFounderCertificate = (): Promise<boolean> => {
    return pickDocuments({ type: "public.item", multiple: false })
      .then((files) => {
        setIsFileUploading(true);
        return postFounderCertificate(files, code);
      })
      .then(() => setHasUploadFile(true))
      .then(() => true)
      .catch(() => {
        NotificationService.error(t("feedback.file_error"));
        return false;
      })
      .finally(() => setIsFileUploading(false));
  };

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
        <LimitEdit code={code} onSuccess={() => setIsLimitRequest(false)} />
      </DeFiModal>

      {code && (
        <DeFiModal
          isVisible={isKycDataEdit}
          setIsVisible={setKycDataEdit}
          title={t("model.user.edit")}
          style={{ width: 500 }}
        >
          <KycDataEdit code={code} kycData={kycData} onChanged={onChanged} />
        </DeFiModal>
      )}

      {kycInfo &&
        (startProcess && kycInfo.sessionUrl ? (
          <View style={styles.container}>
            {kycInfo.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={kycInfo.setupUrl} />
              </View>
            )}
            {kycInfo.kycStatus === KycStatus.CHATBOT ? (
              <View style={styles.container}>
                <ChatbotScreen
                  sessionUrl={kycInfo.sessionUrl}
                  onFinish={() => {
                    finishChatBot();
                  }}
                />
              </View>
            ) : (
              <Iframe src={kycInfo.sessionUrl} />
            )}
          </View>
        ) : (
          <>
            <Portal>
              <Dialog
                visible={showsUploadDialog && kycData?.accountType === AccountType.BUSINESS && !hasUploadedFile}
                onDismiss={() => setShowsUploadDialog(false)}
                style={AppStyles.dialog}
              >
                <Dialog.Content>
                  <Paragraph>{t("model.kyc.request_business")}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <DeFiButton color={Colors.Grey}>{t("action.abort")}</DeFiButton>
                  <DeFiButton onPress={doUpload} loading={isFileUploading}>
                    {t("action.upload")}
                  </DeFiButton>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <View>
              {!settings?.isIframe && <SpacerV height={30} />}

              <H2 text={t("model.kyc.status")} />
              <SpacerV />
              <DataTable>
                <CompactRow>
                  <CompactCell>{t("model.kyc.status")}</CompactCell>
                  <CompactCell multiLine>{getKycStatusString(kycInfo)}</CompactCell>
                </CompactRow>
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
              {kycInfo.kycState !== KycState.REVIEW && (
                <ButtonContainer>
                  <DeFiButton mode="contained" onPress={() => onContinue(kycInfo)}>
                    {t(kycCompleted(kycInfo.kycStatus) ? "model.kyc.increase_limit" : "action.next")}
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
