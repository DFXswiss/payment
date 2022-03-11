import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeFiButton } from "../../elements/Buttons";
import { Checkbox } from "../../elements/Checkbox";
import { SpacerV } from "../../elements/Spacers";
import { Environment } from "../../env/Environment";
import { ApiError } from "../../models/ApiDto";
import { HistoryType } from "../../models/HistoryType";
import { createHistoryCsv } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import { openUrl } from "../../utils/Utils";

const HistorySelect = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [types, setTypes] = useState<{ [type: string]: boolean }>(
    Object.values(HistoryType).reduce((prev, curr) => ({ ...prev, [curr]: true }), {})
  );

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

export default HistorySelect;
