import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { Session } from "../services/AuthService";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const OnBoardingScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const route = useRoute();
  const [url, setUrl] = useState("");

  useAuthGuard(session);

  useEffect(() => {
    const params = route.params as any;
    setUrl(params?.url);

    // reset params
    nav.navigate(Routes.OnBoarding, { url: undefined });
  }, []);

  return (
    <AppLayout>
      <SpacerV height={20} />
      <View style={styles.container}>
        <Iframe src={url} />
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
});

export default withSession(OnBoardingScreen);
