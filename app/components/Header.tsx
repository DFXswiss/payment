import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { changeLanguage } from "../i18n/i18n";
import * as nav from "../utils/NavigationHelper";
import { Picker } from "@react-native-picker/picker";
import AppStyles from "../styles/AppStyles";
import { useTranslation } from "react-i18next";
import SessionService, { Credentials } from "../services/SessionService";
import withCredentials from "../hocs/withCredentials";
import { ActionLink } from "../elements/Texts";
import SettingsService, { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";

const Header = ({ credentials, settings }: { credentials?: Credentials, settings?: AppSettings }) => {
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState("de");

  useEffect(() => {
    SettingsService.Settings.then((settings) => setSelectedLanguage(settings.language));
  }, [settings]);

  const logout = () => SessionService.logout().then(() => nav.navigate(Routes.Login));
  const goHome = () => nav.navigate(credentials?.isLoggedIn ? Routes.Home : Routes.Login);
  const languageChanged = (language: string) => {
    setSelectedLanguage(language);
    changeLanguage(language);
  };

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      <TouchableOpacity activeOpacity={1} style={styles.logoTouch} onPress={() => goHome()}>
        <Image style={styles.logo} source={require("../assets/logo_defichange.png")} />
      </TouchableOpacity>

      <View style={[AppStyles.containerHorizontal, AppStyles.mla, { alignItems: "baseline" }]}>
        {credentials?.isLoggedIn && <ActionLink action={() => logout()} label={t("action.logout")} />}

        <Picker
          style={[AppStyles.ml10, styles.languageSelect]}
          selectedValue={selectedLanguage}
          onValueChange={(itemValue, itemIndex) => languageChanged(itemValue)}
        >
          <Picker.Item label="Deutsch" value="de" />
          <Picker.Item label="English" value="en" />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  logoTouch: {
    width: 150,
    height: 30,
  },
  logo: {
    flex: 1,
    resizeMode: "contain",
  },
  languageSelect: {
    color: Colors.Primary,
    borderColor: Colors.Primary,
  },
});

export default withSettings(withCredentials(Header));
