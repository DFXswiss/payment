import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable, Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { Alert, H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import AppStyles from "../styles/AppStyles";
import * as DocumentPicker from "expo-document-picker";
import NotificationService from "../services/NotificationService";
import { parseSepaXml, readAsString } from "../utils/Utils";
import { StyleSheet, View } from "react-native";
import { useDevice } from "../hooks/useDevice";
import { useState } from "react";
import DeFiModal from "../components/util/DeFiModal";
import { Payment } from "../models/Payment";
import ButtonContainer from "../components/util/ButtonContainer";
import { CompactRow, CompactCell } from "../elements/Tables";
import { postPayment } from "../services/ApiService";

const AdminScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();

  useAuthGuard(session, [UserRole.Admin]);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("admin.title")} />

      <SpacerV height={20} />

      <PaymentsUpload />

      <SpacerV height={20} />

      <Text>TODO: user list</Text>
    </AppLayout>
  );
};

const PaymentsUpload = () => {
  const { t } = useTranslation();
  const device = useDevice();

  const paymentData = (payment: Payment) => [
    { label: "model.route.iban", value: payment.iban },
    { label: "model.payment.amount", value: `${payment.amount} ${payment.currency}` },
    { label: "model.user.name", value: payment.userName },
    { label: "model.user.home", value: payment.userAddress },
    { label: "model.user.country", value: payment.userCountry },
    { label: "model.route.bank_usage", value: payment.bankUsage },
    { label: "model.payment.value_date", value: payment.received },
    { label: "model.payment.bank_transaction_id", value: payment.bankTransactionId },
  ];

  const [paymentsVisible, setPaymentsVisible] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsSaving, setPaymentsSaving] = useState(false);
  const [error, setError] = useState(false);

  const uploadXml = () => {
    DocumentPicker.getDocumentAsync({ type: "text/xml" })
      .then((document) => {
        if (document.type === "success" && document.file?.type === "text/xml") {
          return readAsString(document.file);
        } else {
          throw new Error();
        }
      })
      .then(parseSepaXml)
      .then(setPayments)
      .then(() => setError(false))
      .then(() => setPaymentsVisible(true))
      .catch(() => NotificationService.show(t("feedback.file_error")));
  };
  const savePayments = () => {
    setError(false);
    setPaymentsSaving(true);

    payments
      .reduce((prev, curr) => prev.then(() => postPayment(curr)), Promise.resolve())
      .then(() => setPaymentsVisible(false))
      .catch(() => setError(true))
      .finally(() => setPaymentsSaving(false));
  };

  return (
    <>
      <DeFiModal
        isVisible={paymentsVisible}
        setIsVisible={setPaymentsVisible}
        title={t("model.payment.new")}
        style={{ width: 500 }}
      >
        {payments.map((payment, i) => (
          <View key={i}>
            <DataTable>
              {paymentData(payment).map((data) => (
                <CompactRow key={data.label}>
                  <CompactCell style={{ flex: 1 }}>{t(data.label)}</CompactCell>
                  <CompactCell style={{ flex: 2 }}>{data.value}</CompactCell>
                </CompactRow>
              ))}
            </DataTable>
            <SpacerV height={30} />
          </View>
        ))}
        {error && (
          <>
            <Alert label={t("feedback.save_failed")} />
            <SpacerV />
          </>
        )}
        <ButtonContainer>
          <DeFiButton
            mode="contained"
            loading={paymentsSaving}
            onPress={savePayments}
          >
            {t("action.save")}
          </DeFiButton>
        </ButtonContainer>
      </DeFiModal>

      <View style={device.SM && [AppStyles.containerHorizontal, styles.large]}>
        <H3 text={t("model.payment.register")} />
        <DeFiButton mode="contained" onPress={uploadXml}>
          {t("action.upload")}
        </DeFiButton>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  large: {
    justifyContent: "space-between",
  },
});

export default withSession(AdminScreen);
