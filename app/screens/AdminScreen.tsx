import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/User";
import { Session } from "../services/AuthService";
import AppStyles from "../styles/AppStyles";
import NotificationService from "../services/NotificationService";
import { StyleSheet, View } from "react-native";
import { useDevice } from "../hooks/useDevice";
import { postSepaFiles } from "../services/ApiService";
import { openUrl, pickDocuments } from "../utils/Utils";
import { Environment } from "../env/Environment";

const AdminScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  useEffect(() => {
    let url = `${Environment.services}`;
    openUrl(url, false);
  }, []);
  useAuthGuard(session, [UserRole.Admin]);

  return (
    <AppLayout>
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

  const uploadXml = () => {
    pickDocuments({ type: "text/xml", multiple: true })
      .then(postSepaFiles)
      .then(() => NotificationService.success(t("feedback.save_successful")))
      .catch(() => NotificationService.error(t("feedback.file_error")));
  };

  return (
    <View style={device.SM && [AppStyles.containerHorizontal, styles.large]}>
      <H3 text={t("model.payment.register")} />
      <DeFiButton mode="contained" onPress={uploadXml}>
        {t("action.upload")}
      </DeFiButton>
    </View>
  );
};

const styles = StyleSheet.create({
  large: {
    justifyContent: "space-between",
  },
});

export default withSession(AdminScreen);
