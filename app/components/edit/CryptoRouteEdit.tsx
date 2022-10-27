import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { ApiError } from "../../models/ApiDto";
import { Asset } from "../../models/Asset";
import { Blockchain } from "../../models/Blockchain";
import { BuyType } from "../../models/BuyRoute";
import { CryptoRoute } from "../../models/CryptoRoute";
import { getAssets, postCryptoRoute, putCryptoRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import ButtonContainer from "../util/ButtonContainer";
import Loading from "../util/Loading";

const CryptoRouteEdit = ({ onRouteCreated }: { onRouteCreated: (route: CryptoRoute) => void }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CryptoRoute>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: CryptoRoute) => {
    setIsSaving(true);
    setError(undefined);

    route.type = BuyType.WALLET;

    postCryptoRoute(route)
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode === 409 ? "model.route.conflict" : ""))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    blockchain: Validations.Required,
    asset: Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="blockchain"
        label={t("model.route.blockchain")}
        items={[Blockchain.BITCOIN]}
        labelFunc={(i) => i}
      />
      <SpacerV />
      <DeFiPicker
        name="asset"
        label={t("model.route.asset")}
        items={assets.filter((a) => a.id === 2)} // only dBTC is allowed right now
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
      />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${t(error)}`} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default CryptoRouteEdit;
