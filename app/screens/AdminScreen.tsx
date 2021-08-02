import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable, Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
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

const paymentData = (payment: Payment) => [
  { label: "model.route.iban", value: payment.iban },
  { label: "model.payment.amount", value: `${payment.amount} ${payment.fiat}` },
  { label: "model.user.name", value: payment.userName },
  { label: "model.user.home", value: payment.userAddress },
  { label: "model.user.country", value: payment.userCountry },
  { label: "model.route.bank_usage", value: payment.bankUsage },
];

const AdminScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [paymentsVisible, setPaymentsVisible] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  useAuthGuard(session, [UserRole.Admin]);

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
      .then(() => setPaymentsVisible(true))
      .catch(() => NotificationService.show(t("feedback.file_error")));
  };
  const savePayments = () => {
    // TODO: use the payment API
    setPaymentsVisible(false);
  };

  return (
    <AppLayout>
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
        <ButtonContainer>
          <DeFiButton mode="contained" loading={false} onPress={savePayments}>
            {t("action.ok")}
          </DeFiButton>
        </ButtonContainer>
      </DeFiModal>

      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("admin.title")} />
      <SpacerV height={20} />

      <View style={device.SM && [AppStyles.containerHorizontal, styles.large]}>
        <H3 text={t("model.payment.register")} />
        <DeFiButton mode="contained" onPress={uploadXml}>
          {t("action.upload")}
        </DeFiButton>
      </View>

      <SpacerV height={20} />

      <Text>TODO: user list</Text>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  large: {
    justifyContent: "space-between",
  },
});

export default withSession(AdminScreen);
