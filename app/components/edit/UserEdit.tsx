import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { User, UserDetail } from "../../models/User";
import { putUser } from "../../services/ApiService";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import Validations from "../../utils/Validations";
import { Alert } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { ApiError } from "../../models/ApiDto";
import { KycData } from "../../models/KycData";

interface Props {
  user?: UserDetail;
  onUserChanged: (user: UserDetail) => void;
}

const UserEdit = ({ user, onUserChanged }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<User & KycData>({ defaultValues: user });
  const country = useWatch({ control, name: "country" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = (updatedUser: User & KycData) => {
    setIsSaving(true);
    setError(undefined);

    putUser(updatedUser)
      .then(onUserChanged)
      .catch((error: ApiError) => setError(error.statusCode === 409 ? "feedback.mail_error" : ""))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    mail: [Validations.Mail],
    usedRef: Validations.Ref,
  });

  return (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <Input name="mail" label={t("model.user.mail")} valueHook={(v: string) => v.trim()} />
      <SpacerV />
      <PhoneNumber
        name="mobileNumber"
        label={t("model.user.mobile_number")}
        placeholder="1761212112"
        wrap={!device.SM}
        country={country?.symbol}
      />
      <SpacerV />

      <Input name="usedRef" label={t("model.user.used_ref")} placeholder="xxx-xxx" />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${error ? t(error) : ""}`} />
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

export default UserEdit;
