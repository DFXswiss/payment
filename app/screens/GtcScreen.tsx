import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import AppLayout from "../components/AppLayout";
import LoadingButton from "../components/util/LoadingButton";
import Routes from "../config/Routes";
import { ActionLink } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { Session } from "../services/AuthService";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";

const GtcScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(false);

  useGuard(() => session && !(session.address && session.signature), [session]);
  useGuard(() => session && session.isLoggedIn, [session], Routes.Home);

  const register = () => {
    setIsProcessing(true);
    SessionService.register(session)
      .finally(() => setIsProcessing(false))
      .then(() => nav.navigate(Routes.Home));
    // TODO: error handling
  };

  return (
    <AppLayout>
      <View style={AppStyles.container}>
        <H3 style={AppStyles.center} text={t("gtc.title")} />

        <Text>TODO: add GTCs</Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate porro iste nisi ducimus, rerum eius.
          Fugiat dicta iste reiciendis tenetur. Distinctio accusamus iusto, harum eos tempore commodi culpa numquam
          unde?
        </Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate porro iste nisi ducimus, rerum eius.
          Fugiat dicta iste reiciendis tenetur. Distinctio accusamus iusto, harum eos tempore commodi culpa numquam
          unde?
        </Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate porro iste nisi ducimus, rerum eius.
          Fugiat dicta iste reiciendis tenetur. Distinctio accusamus iusto, harum eos tempore commodi culpa numquam
          unde?
        </Text>

        <SpacerV />

        <View style={AppStyles.containerHorizontal}>
          <ActionLink label={t("action.back")} onPress={() => nav.navigate(Routes.Login)} />
          <View style={AppStyles.mla}>
            <LoadingButton title={t("action.accept")} isLoading={isProcessing} onPress={() => register()} />
          </View>
        </View>
      </View>
    </AppLayout>
  );
};

export default withSession(GtcScreen);
