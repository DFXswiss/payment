import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { Fiat } from "../../models/Fiat";
import { SellRoute } from "../../models/SellRoute";
import { User } from "../../models/User";
import { getFiats, postSellRoute } from "../../services/ApiService";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";

const SellRouteEdit = ({
  isVisible,
  onRouteCreated,
  user,
}: {
  isVisible: boolean;
  onRouteCreated: (route: SellRoute) => void;
  user?: User;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellRoute>();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => {
    reset({ fiat: fiats[0] });
    setError(false);
  }, [isVisible]);
  useEffect(() => {
    getFiats()
      .then(setFiats)
      .catch(() => NotificationService.show(t("feedback.load_failed")));
  }, []);

  const onSubmit = (route: SellRoute) => {
    setIsSaving(true);
    setError(false);

    postSellRoute(route)
      .then((newRoute) => onRouteCreated(newRoute))
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  const rules: any = {
    fiat: Validations.Required(t),
    iban: { ...Validations.Required(t), ...Validations.Iban(t) },
  };

  const userDataMissing = !(user?.firstName && user?.lastName && user?.street && user?.zip && user?.location && user?.country && user?.mobileNumber);

  return (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      {userDataMissing && (
        <>
          <Alert label={t("model.user.data_missing")} />
          <SpacerV />
        </>
      )}
      <DeFiPicker
        name="fiat"
        label={t("model.route.fiat")}
        items={fiats.filter((f) => f.enable)}
        idProp="id"
        labelProp="name"
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.iban")} placeholder="DE89 3704 0044 0532 0130 00" />
      <SpacerV />

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} disabled={userDataMissing} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default SellRouteEdit;
