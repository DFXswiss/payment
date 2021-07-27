import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { UserRole } from "../models/ApiDto";
import { Session } from "../services/AuthService";
import AppStyles from "../styles/AppStyles";

const AdminScreen = ({ session }: { session?: Session }) => {
  const {t} = useTranslation();

  useGuard(() => session && !session.isLoggedIn, [session]);
  useGuard(() => session && session.role != UserRole.Admin, [session], Routes.Home);

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
