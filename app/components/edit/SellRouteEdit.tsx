import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
import { getFiats, getKycCountries, postSellRoute } from "../../services/ApiService";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ApiError } from "../../models/ApiDto";
import { Country } from "../../models/Country";
import Loading from "../util/Loading";
import { Blockchain } from "../../models/Blockchain";
import { Session } from "../../services/AuthService";

const SellRouteEdit = ({
  onRouteCreated,
  session,
}: {
  onRouteCreated: (route: SellRoute) => void;
  session?: Session;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SellRoute>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fiats, setFiats] = useState<Fiat[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const blockchainPreselection = getBlockchainPreselection();
    if (blockchainPreselection) setValue("blockchain", blockchainPreselection);

    Promise.all([getFiats(), getKycCountries()])
      .then(([f, c]) => {
        setFiats(f);
        setCountries(c);
      })
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: SellRoute) => {
    setIsSaving(true);
    setError(undefined);

    const blockchain = getBlockchainPreselection();
    if (!route.blockchain && blockchain) {
      route.blockchain = blockchain;
    }

    postSellRoute(route)
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode == 409 ? "model.route.conflict" : ""))
      .finally(() => setIsSaving(false));
  };

  const isBlockchainsEnabled = (): boolean => {
    return getBlockchains().length > 1;
  };

  const getBlockchainPreselection = (): Blockchain | undefined => {
    return !isBlockchainsEnabled() && getBlockchains().length > 0 ? getBlockchains()[0] : undefined;
  };

  const getBlockchains = (): Blockchain[] => {
    return session?.blockchains ?? [];
  };

  const rules: any = createRules({
    fiat: Validations.Required,
    iban: [Validations.Required, Validations.Iban(countries)],
    blockchain: isBlockchainsEnabled() && Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="fiat"
        label={t("model.route.fiat")}
        items={fiats.filter((f) => f.enable)}
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
      />
      <SpacerV />

      <DeFiPicker
        name="blockchain"
        label={t("model.route.blockchain")}
        items={getBlockchains()}
        labelFunc={(i) => i}
        disabled={!isBlockchainsEnabled()}
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.your_iban")} placeholder="DE89 3704 0044 0532 0130 00" />
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

export default SellRouteEdit;
