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
import { KycData } from "../models/KycData";
import KycDataEdit from "../components/edit/KycDataEdit";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [isLimitRequest, setIsLimitRequest] = useState(false);
  const [code, setCode] = useState<string>();
  const [kycResult, setKycResult] = useState<KycResult>();
  const [startProcess, setStartProcess] = useState<boolean>(false);
  const [kycData, setKycData] = useState<KycData>();
  const [isKycDataEdit, setKycDataEdit] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

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

  const updateState = (result: KycResult, params?: any) => {
    setKycResult(result);
    if (!result.kycDataComplete) {
      setKycData({ accountType: AccountType.PERSONAL, ...params })
      setKycDataEdit(true);
    }
    setIsLoading(false);
  };

  const onContinue = (result: KycResult) => {
    if (kycInProgress(result?.kycStatus)) {
      if (!result?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      // load iframe
      setIsLoading(true);
      setStartProcess(true);
      setTimeout(() => setIsLoading(false), 2000);
    } else if (kycCompleted(result?.kycStatus)) {
      setIsLimitRequest(true);
    }
  };

  const onChanged = (newKycData: KycData) => {
    setKycData(newKycData);
    setKycDataEdit(false);
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
      .then(() => true)
      .catch(() => {
        NotificationService.error(t("feedback.file_error"));
        return false;
      })
      .finally(() => setIsFileUploading(false));
  };

  return (
    <AppLayout
      preventScrolling={kycResult?.kycStatus === KycStatus.CHATBOT}
      removeHeaderSpace={kycResult?.kycStatus === KycStatus.CHATBOT}
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
                <ChatbotScreen
                  sessionUrl={kycResult.sessionUrl}
                  onFinish={() => {
                    finishChatBot();
                  }}
                />
              </View>
            ) : (
              <Iframe src={kycResult.sessionUrl} />
            )}
          </View>
        ) : (
          <>
            <Portal>
              <Dialog visible={!isKycDataEdit && kycData?.accountType === AccountType.BUSINESS} style={AppStyles.dialog}>
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
                  <CompactCell multiLine>{getKycStatusString(kycResult)}</CompactCell>
                </CompactRow>
                <CompactRow>
                  <CompactCell>{t("model.user.limit")}</CompactCell>
                  <CompactCell>{getTradeLimit(kycResult)}</CompactCell>
                </CompactRow>
              </DataTable>
              <SpacerV />
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
