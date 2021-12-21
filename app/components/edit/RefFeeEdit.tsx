import DeFiPicker from "../../components/form/DeFiPicker";
import Form from "../../components/form/Form";
import ButtonContainer from "../../components/util/ButtonContainer";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import { Paragraph } from "react-native-paper";
import { updateRefFee } from "../../services/ApiService";
import Colors from "../../config/Colors";
import { StyleSheet, View } from "react-native";
import AppStyles from "../../styles/AppStyles";

interface FeeItem {
  label: string;
  value: number;
}

const possibleFees = [0.5, 0.25, 0.1];

const RefFeeEdit = ({
  currentRefFee,
  onRefFeeChanged,
  onCancel,
}: {
  currentRefFee: number;
  onRefFeeChanged: (fee: number) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ fee: FeeItem }>({ defaultValues: { fee: { value: currentRefFee } } });
  const newFee = useWatch({ control, name: "fee" });

  const [isConfirm, setIsConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = ({ fee }: { fee: FeeItem }) => {
    if (fee.value != currentRefFee) {
      setIsConfirm(true);
    } else {
      onCancel();
    }
  };

  const onConfirm = () => {
    setIsSaving(true);

    updateRefFee(newFee.value)
      .then(() => onRefFeeChanged(newFee.value))
      .catch(() => setError(true))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    fee: Validations.Required,
  });

  return isConfirm ? (
    <>
      <Paragraph>{t("model.user.ref_commission_hint", { fee: newFee.value })}</Paragraph>
      <SpacerV />

      {error && (
        <>
          <Alert label={t("feedback.save_failed")} />
          <SpacerV />
        </>
      )}

      <View style={[AppStyles.containerHorizontal, styles.buttonContainer]}>
        <DeFiButton onPress={onCancel} color={Colors.Grey}>
          {t("action.abort")}
        </DeFiButton>
        <DeFiButton loading={isSaving} onPress={onConfirm}>
          {t("action.yes")}
        </DeFiButton>
      </View>
    </>
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <Paragraph>{t("model.user.ref_commission_info")}</Paragraph>
      <SpacerV height={15} />

      <DeFiPicker
        name="fee"
        label={t("model.user.ref_commission")}
        items={possibleFees.filter((f) => f <= currentRefFee).map((f) => ({ label: `${f}%`, value: f }))}
        idProp="value"
        labelProp="label"
      />
      <SpacerV />

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "flex-end",
  },
});

export default RefFeeEdit;
