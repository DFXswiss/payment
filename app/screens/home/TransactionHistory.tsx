import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DataTable, Divider, Paragraph } from "react-native-paper";
import ButtonContainer from "../../components/util/ButtonContainer";
import IconButton from "../../components/util/IconButton";
import Colors from "../../config/Colors";
import { DeFiButton } from "../../elements/Buttons";
import { Checkbox } from "../../elements/Checkbox";
import { RadioButton } from "../../elements/RadioButton";
import { SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell } from "../../elements/Tables";
import { H3, H4 } from "../../elements/Texts";
import { Environment } from "../../env/Environment";
import withSettings from "../../hocs/withSettings";
import { ApiError } from "../../models/ApiDto";
import { HistoryType } from "../../models/HistoryType";
import { createHistoryCsv, deleteApiKey, generateApiKey, putApiKeyFilter } from "../../services/ApiService";
import ClipboardService from "../../services/ClipboardService";
import NotificationService from "../../services/NotificationService";
import { AppSettings } from "../../services/SettingsService";
import AppStyles from "../../styles/AppStyles";
import { openUrl } from "../../utils/Utils";

// history filter type helpers
const fromTypeArray = (types?: HistoryType[]): { [type: string]: boolean } =>
  (types ?? Object.values(HistoryType)).reduce((prev, curr) => ({ ...prev, [curr]: true }), {});
const toTypeArray = (types: { [type: string]: boolean }): HistoryType[] => {
  return Object.keys(types).filter((t) => types[t]) as HistoryType[];
};

const TransactionHistory = ({
  settings,
  ctFilter,
  onCtFilterChange,
  onClose,
  apiKey,
  setApiKey,
}: {
  settings?: AppSettings;
  ctFilter?: HistoryType[];
  onCtFilterChange: (filter: HistoryType[]) => void;
  onClose: () => void;
  apiKey?: string;
  setApiKey: (key: string | undefined) => void;
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyLoading, setIsKeyLoading] = useState(false);
  const [apiSecret, setApiSecret] = useState<string | undefined>(undefined);
  const [ctFilterEnabled, setCtFilterEnabled] = useState<boolean>(!(ctFilter?.length === 0));
  const [ctTypes, setCtTypes] = useState<{ [type: string]: boolean }>(fromTypeArray(ctFilter));
  const [csvTypes, setCsvTypes] = useState<{ [type: string]: boolean }>(fromTypeArray());

  const onOpenCt = () => {
    let url = "https://cointracking.info/?ref=D270827";
    url += settings?.language ? `&language=${settings.language.toLowerCase()}` : "";
    openUrl(url);
  };

  const onGenerateKey = () => {
    setIsKeyLoading(true);
    generateApiKey(toTypeArray(ctTypes))
      .then((keys) => {
        setApiKey(keys.key);
        setApiSecret(keys.secret);
      })
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsKeyLoading(false));
  };

  const onDeleteKey = () => {
    setIsKeyLoading(true);
    deleteApiKey()
      .then(() => setApiKey(undefined))
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsKeyLoading(false));
  };

  const enableCtFilter = (enabled: boolean) => {
    setCtFilterEnabled(enabled);
    updateFilter(enabled ? ctTypes : {});
  };

  const toggleCtFilter = (type: HistoryType) => {
    setCtTypes((t) => {
      const types = { ...t, [type]: !t[type] };
      updateFilter(types);
      return types;
    });
  };

  const updateFilter = (types: { [type: string]: boolean }) => {
    putApiKeyFilter(toTypeArray(types))
      .then(onCtFilterChange)
      .then(() => NotificationService.success(t("feedback.saved")))
      .catch(() => NotificationService.error(t("feedback.save_failed")));
  };

  const onExportHistory = () => {
    setIsLoading(true);
    createHistoryCsv(toTypeArray(csvTypes))
      .then((fileKey) => openUrl(`${Environment.api.baseUrl}/history/csv?key=${fileKey}`))
      .catch((error: ApiError) =>
        NotificationService.error(t(error.statusCode === 404 ? "model.route.no_tx" : "feedback.load_failed"))
      )
      .finally(onClose);
  };

  return (
    <>
      <H3 text={t("model.history.ct_link")} />
      <DeFiButton mode="contained" onPress={onOpenCt}>
        {t("model.history.ct_website")}
      </DeFiButton>
      <SpacerV />

      {apiKey == null ? (
        <>
          <Paragraph>{t("model.history.ct_text")}</Paragraph>
          <SpacerV />
          <DeFiButton mode="contained" loading={isKeyLoading} onPress={onGenerateKey}>
            {t("model.history.create_api_key")}
          </DeFiButton>
        </>
      ) : (
        <>
          <DataTable>
            <CompactRow>
              <CompactCell>API-Key</CompactCell>
              <CompactCell style={{ flex: 2 }} multiLine>
                {apiKey}
              </CompactCell>
              <CompactCell style={{ flex: undefined }}>
                <IconButton icon="content-copy" onPress={() => ClipboardService.copy(apiKey)} />
              </CompactCell>
            </CompactRow>
            {apiSecret && (
              <CompactRow>
                <CompactCell>API-Secret</CompactCell>
                <CompactCell style={{ flex: 2 }} multiLine>
                  {apiSecret}
                </CompactCell>
                <CompactCell style={{ flex: undefined }}>
                  <IconButton icon="content-copy" onPress={() => ClipboardService.copy(apiSecret)} />
                </CompactCell>
              </CompactRow>
            )}
          </DataTable>

          <ButtonContainer>
            <DeFiButton loading={isKeyLoading} onPress={onDeleteKey}>
              {t("model.history.delete_api_key")}
            </DeFiButton>
          </ButtonContainer>
        </>
      )}

      <SpacerV />
      <H4 text={t("model.history.ct_filter_text")} />

      <View style={AppStyles.containerHorizontalWrap}>
        <RadioButton
          label={t("model.history.filter_inactive")}
          onPress={() => enableCtFilter(false)}
          checked={!ctFilterEnabled}
        />
        <RadioButton
          label={t("model.history.filter_active")}
          onPress={() => enableCtFilter(true)}
          checked={ctFilterEnabled}
        />
      </View>

      <View style={{ marginLeft: 30 }}>
        {Object.values(HistoryType).map((type) => (
          <Checkbox
            key={type}
            checked={ctTypes[type]}
            disabled={!ctFilterEnabled}
            label={t(`model.history.${type}`)}
            onPress={() => toggleCtFilter(type)}
          />
        ))}
      </View>

      <SpacerV height={20} />
      <Divider style={{ backgroundColor: Colors.LightGrey }} />
      <SpacerV height={20} />

      <H3 text={t("model.history.csv_export")} />
      {Object.values(HistoryType).map((type) => (
        <Checkbox
          key={type}
          checked={csvTypes[type]}
          label={t(`model.history.${type}`)}
          onPress={() => setCsvTypes((t) => ({ ...t, [type]: !t[type] }))}
        />
      ))}
      <SpacerV />

      <ButtonContainer>
        <DeFiButton
          mode="contained"
          loading={isLoading}
          onPress={onExportHistory}
          disabled={Object.values(csvTypes).find((v) => v) == null}
        >
          {t("action.next")}
        </DeFiButton>
      </ButtonContainer>
    </>
  );
};

export default withSettings(TransactionHistory);
