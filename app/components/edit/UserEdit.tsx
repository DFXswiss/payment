import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { User, UserDetail } from "../../models/User";
import { deleteAccount, deleteWallet, putUser } from "../../services/ApiService";
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
import { Divider, Paragraph } from "react-native-paper";
import Colors from "../../config/Colors";
import NotificationService from "../../services/NotificationService";
import SessionService from "../../services/SessionService";

interface Props {
  user?: UserDetail;
  onUserChanged: (user: UserDetail) => void;
  onClose: () => void;
}

const UserEdit = ({ user, onUserChanged, onClose }: Props) => {
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
  const [showMergeHint, setShowMergeHint] = useState(false);
  const [showDeleteWalletHint, setShowDeleteWalletHint] = useState(false);
  const [showDeleteAccountHint, setShowDeleteAccountHint] = useState(false);

  const onSubmit = (updatedUser: User & KycData) => {
    setIsSaving(true);
    setError(undefined);

    putUser(updatedUser)
      .then((r) => {
        onUserChanged(r.user);
        r.userExists ? setShowMergeHint(true) : onClose();
      })
      .catch((error: ApiError) => setError(error.statusCode === 409 ? "feedback.mail_error" : ""))
      .finally(() => setIsSaving(false));
  };

  const onWalletDelete = () => onDelete(deleteWallet);
  const onAccountDelete = () => onDelete(deleteAccount);

  const onDelete = (method: () => Promise<void>) => {
    setIsSaving(true);
    method()
      .then(() => SessionService.logout())
      .catch(() => NotificationService.error(t("feedback.delete_failed")))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    mail: [Validations.Mail],
  });

  if (showMergeHint) {
    return (
      <>
        <Paragraph>{t("model.user.merge")}</Paragraph>
        <SpacerV />

        <ButtonContainer>
          <DeFiButton mode="contained" onPress={onClose}>
            {t("action.ok")}
          </DeFiButton>
        </ButtonContainer>
      </>
    );
  }

  if (showDeleteWalletHint) {
    return (
      <>
        <Paragraph>{t("model.user.delete_wallet_hint")}</Paragraph>
        <SpacerV />

        <ButtonContainer>
          <DeFiButton mode="contained" color={Colors.Grey} onPress={() => setShowDeleteWalletHint(false)}>
            {t("action.abort")}
          </DeFiButton>
          <DeFiButton mode="contained" loading={isSaving} onPress={onWalletDelete}>
            {t("action.ok")}
          </DeFiButton>
        </ButtonContainer>
      </>
    );
  }

  if (showDeleteAccountHint) {
    return (
      <>
        <Paragraph>{t("model.user.delete_account_hint")}</Paragraph>
        <SpacerV />

        <ButtonContainer>
          <DeFiButton mode="contained" color={Colors.Grey} onPress={() => setShowDeleteAccountHint(false)}>
            {t("action.abort")}
          </DeFiButton>
          <DeFiButton mode="contained" loading={isSaving} onPress={onAccountDelete}>
            {t("action.ok")}
          </DeFiButton>
        </ButtonContainer>
      </>
    );
  }

  return (
    <>
      <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
        <Input name="mail" label={t("model.user.mail")} valueHook={(v: string) => v.trim()} />
        <SpacerV />
        <PhoneNumber
          name="phone"
          label={t("model.user.mobile_number")}
          placeholder="1761212112"
          wrap={!device.SM}
          country={country?.symbol}
        />
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

      <SpacerV height={20} />
      <Divider style={{ backgroundColor: Colors.LightGrey }} />
      <SpacerV height={20} />

      <ButtonContainer>
        <DeFiButton onPress={() => setShowDeleteWalletHint(true)}>{t("model.user.delete_wallet")}</DeFiButton>
        <DeFiButton onPress={() => setShowDeleteAccountHint(true)}>{t("model.user.delete_account")}</DeFiButton>
      </ButtonContainer>
    </>
  );
};

export default UserEdit;
