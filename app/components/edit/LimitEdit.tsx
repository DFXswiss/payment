import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import ButtonContainer from "../util/ButtonContainer";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { createRules, pickDocuments, toBase64 } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import Input from "../form/Input";
import { Alert } from "../../elements/Texts";
import { LimitRequest, Limit, FundOrigin, InvestmentDate } from "../../models/LimitRequest";
import AppStyles from "../../styles/AppStyles";
import { View } from "react-native";
import IconButton from "../util/IconButton";
import { postLimit } from "../../services/ApiService";
import { Paragraph } from "react-native-paper";

const LimitLabels = {
  [Limit.K_500]: "CHF 100'000 - 500'000",
  [Limit.M_1]: "CHF 500'000 - 1'000'000",
  [Limit.M_5]: "CHF 1'000'000 - 5'000'000",
  [Limit.M_10]: "CHF 5'000'000 - 10'000'000",
  [Limit.M_15]: "CHF 10'000'000 - 15'000'000",
  [Limit.INFINITY]: "> CHF 15'000'000",
};

const LimitEdit = ({ code, onSuccess }: { code?: string; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const [fileSize, setFileSize] = useState<number>(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LimitRequest>();
  const investmentDate = useWatch({ control, name: "investmentDate" });

  const rules: any = createRules({
    limit: Validations.Required,
    investmentDate: Validations.Required,
    fundOrigin: Validations.Required,
    documentProofName: Validations.Custom(() => (fileSize > 10000000 ? "validation.file_too_large" : true)),
  });

  const onSubmit = (request: LimitRequest) => {
    setIsSaving(true);
    setError(undefined);

    postLimit(request, code)
      .then(() => setIsSubmitted(true))
      .catch(() => setError(""))
      .finally(() => setIsSaving(false));
  };

  const uploadDocument = () => {
    pickDocuments({ type: "public.item", multiple: false }).then((files) => {
      const file = files[0];

      setFileSize(file.size);
      setValue("documentProofName", file.name);
      toBase64(file).then((a) => setValue("documentProof", a));
    });
  };

  return isSubmitted ? (
    <>
      <Paragraph>{t("model.kyc.limit_request_submitted")}</Paragraph>
      <SpacerV />
      <ButtonContainer>
        <DeFiButton mode="contained" onPress={onSuccess}>
          {t("action.ok")}
        </DeFiButton>
      </ButtonContainer>
    </>
  ) : (
    <Form control={control} rules={rules} errors={errors} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="limit"
        label={t("model.kyc.volume")}
        items={Object.values(Limit).filter((i) => typeof i !== "string")}
        labelFunc={(i: Limit) => LimitLabels[i]}
      />
      <SpacerV />

      <DeFiPicker
        name="investmentDate"
        label={t("model.kyc.investment_date")}
        items={Object.values(InvestmentDate)}
        labelFunc={(i) => t(`model.kyc.${i.toLowerCase()}`)}
      />
      <SpacerV />

      <DeFiPicker
        name="fundOrigin"
        label={t("model.kyc.fund_origin")}
        items={Object.values(FundOrigin)}
        labelFunc={(i) => t(`model.kyc.${i.toLowerCase()}${investmentDate === InvestmentDate.FUTURE ? "_future" : ""}`)}
      />
      <SpacerV />

      <Input name="fundOriginText" label={t("model.kyc.fund_origin_text")} />
      <SpacerV />

      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="documentProofName" label={t("model.kyc.document_proof")} editable={false} />
        <IconButton icon="file-upload-outline" size={40} onPress={uploadDocument} />
      </View>
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${error ? t(error) : ""}`} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.send")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default LimitEdit;
