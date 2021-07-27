import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { UserRole } from "../models/ApiDto";
import { Session } from "../services/AuthService";
import AppStyles from "../styles/AppStyles";

const AdminScreen = ({ session }: { session?: Session }) => {
  const {t} = useTranslation();

  useAuthGuard(session, [UserRole.Admin]);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("admin.title")} />
      <SpacerV height={20} />

      <Text>TODO</Text>
    </AppLayout>
  );
};

export default withSession(AdminScreen);
