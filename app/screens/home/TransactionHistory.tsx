import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, Divider, Paragraph } from "react-native-paper";
import ButtonContainer from "../../components/util/ButtonContainer";
import IconButton from "../../components/util/IconButton";
import Colors from "../../config/Colors";
import { DeFiButton } from "../../elements/Buttons";
import { Checkbox } from "../../elements/Checkbox";
import { SpacerV } from "../../elements/Spacers";
import { CompactRow, CompactCell } from "../../elements/Tables";
import { H3 } from "../../elements/Texts";
import { Environment } from "../../env/Environment";
import withSettings from "../../hocs/withSettings";
import { ApiError } from "../../models/ApiDto";
import { HistoryType } from "../../models/HistoryType";
import { createHistoryCsv, deleteApiKey, generateApiKey } from "../../services/ApiService";
import ClipboardService from "../../services/ClipboardService";
import NotificationService from "../../services/NotificationService";
import { AppSettings } from "../../services/SettingsService";
import { openUrl } from "../../utils/Utils";

const TransactionHistory = ({
  settings,
  onClose,
  apiKey,
  setApiKey,
}: {
  settings?: AppSettings;
  onClose: () => void;
  apiKey?: string;
  setApiKey: (key: string | undefined) => void;
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyLoading, setIsKeyLoading] = useState(false);
  const [apiSecret, setApiSecret] = useState<string | undefined>(undefined);
  const [types, setTypes] = useState<{ [type: string]: boolean }>(
    Object.values(HistoryType).reduce((prev, curr) => ({ ...prev, [curr]: true }), {})
  );

  const onOpenCt = () => {
    let url = "https://cointracking.info/?ref=D270827";
    url += settings?.language ? `&language=${settings.language.toLowerCase()}` : "";
    openUrl(url);
  };

  const onGenerateKey = () => {
    setIsKeyLoading(true);
    generateApiKey()
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

  const onExportHistory = () => {
    setIsLoading(true);
    createHistoryCsv(Object.keys(types).filter((t) => types[t]) as HistoryType[])
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

      <SpacerV height={20} />
      <Divider style={{ backgroundColor: Colors.LightGrey }} />
      <SpacerV height={20} />

      <H3 text={t("model.history.csv_export")} />
      {Object.values(HistoryType).map((type) => (
        <Checkbox
          key={type}
          checked={types[type]}
          label={t(`model.history.${type}`)}
          onPress={() => setTypes((t) => ({ ...t, [type]: !t[type] }))}
        />
      ))}
      <SpacerV />

      <ButtonContainer>
        <DeFiButton
          mode="contained"
          loading={isLoading}
          onPress={onExportHistory}
          disabled={Object.values(types).find((v) => v) == null}
        >
          {t("action.next")}
        </DeFiButton>
      </ButtonContainer>
    </>
  );
};

export default withSettings(TransactionHistory);
