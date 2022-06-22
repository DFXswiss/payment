import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { getKyc } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import {
  getKycStatusString,
  getTradeLimit,
  kycCompleted,
  kycInProgress,
  KycResult,
  KycState,
  KycStatus,
} from "../models/User";
import { sleep } from "../utils/Utils";
import KycInit from "../components/KycInit";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";
import { DataTable } from "react-native-paper";
import { CompactRow, CompactCell } from "../elements/Tables";
import ButtonContainer from "../components/util/ButtonContainer";
import LimitEdit from "../components/edit/LimitEdit";
import DeFiModal from "../components/util/DeFiModal";
import ChatbotScreen from "./ChatbotScreen";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [isLimitRequest, setIsLimitRequest] = useState(false);
  const [code, setCode] = useState<string | undefined>();
  const [kycResult, setKycResult] = useState<KycResult | undefined>();

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (!params?.code) return onLoadFailed();

    setCode(params.code);

    // reset params
    nav.navigate(Routes.Kyc, { code: undefined, autostart: undefined });

    // get KYC info
    getKyc(params?.code)
      .then((result) => {
        updateState(result);
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

  const updateState = (result: KycResult) => {
    setKycResult(result);
    setIsLoading(false);
  };

  const onContinue = (result: KycResult) => {
    if (kycInProgress(result?.kycStatus)) {
      if (!result?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      // load iframe
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    } else if (kycCompleted(result?.kycStatus)) {
      setIsLimitRequest(true);
    }
  };

  return (
    <AppLayout>
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <DeFiModal
        isVisible={isLimitRequest}
        setIsVisible={setIsLimitRequest}
        title={t("model.kyc.increase_limit")}
        style={{ width: 400 }}
      >
        <LimitEdit code={code} onSuccess={() => setIsLimitRequest(false)} />
      </DeFiModal>

      {kycResult &&
        (kycResult.sessionUrl ? (
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
            {((kycInProgress(kycResult.kycStatus) && kycResult.kycState !== KycState.REVIEW) ||
              kycCompleted(kycResult.kycStatus)) && (
                <ButtonContainer>
                  <DeFiButton mode="contained" onPress={() => onContinue(kycResult)}>
                    {t(kycCompleted(kycResult.kycStatus) ? "model.kyc.increase_limit" : "action.next")}
                  </DeFiButton>
                </ButtonContainer>
              )}
          </View>
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
