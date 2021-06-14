import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Routes from "../config/Routes";
import { login } from "../services/ApiService";

const LoginScreen = () => {
  const nav = useNavigation();
  const { t } = useTranslation();

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => login().then(() => nav.navigate(Routes.Home))}>
        <Text>{t("action.login")}</Text>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default LoginScreen;
