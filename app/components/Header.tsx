import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Linking } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { changeLanguage } from "../i18n/i18n";
import { Picker } from "@react-native-picker/picker";
import AppStyles from "../styles/AppStyles";
import { useTranslation } from "react-i18next";
import withSession from "../hocs/withSession";
import SettingsService, { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";
import { Session } from "../services/AuthService";
import SessionService from "../services/SessionService";
import { ActionLink } from "../elements/Buttons";
import { useNavigation } from "@react-navigation/native";
import { Environment } from "../env/Environment";

const Header = ({ session, settings }: { session?: Session; settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const [selectedLanguage, setSelectedLanguage] = useState(Environment.defaultLanguage);

  useEffect(() => {
    SettingsService.Settings.then((settings) => setSelectedLanguage(settings.language));
  }, [settings]);

  const logout = () => SessionService.logout().then(() => nav.navigate(Routes.Login));
  const goHome = () => nav.navigate(session?.isLoggedIn ? Routes.Home : Routes.Login);
  const languageChanged = (language: string) => {
    setSelectedLanguage(language);
    changeLanguage(language);
  };

  // TODO: use aspect ratio?
  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      <TouchableOpacity activeOpacity={1} style={styles.logoTouch} onPress={() => goHome()}>
        <Image style={styles.logo} source={require("../assets/logo_defichange.png")} />
      </TouchableOpacity>

      <View style={[AppStyles.containerHorizontal, AppStyles.mla, { alignItems: "baseline" }]}>
        {session?.isLoggedIn && <ActionLink onPress={() => logout()} label={t("action.logout")} />}

        <ActionLink
          style={AppStyles.ml10}
          onPress={() => Linking.openURL("https://defichain-wiki.com/")}
          label={t("general.wiki")}
        />

        <ActionLink
          style={AppStyles.ml10}
          onPress={() => Linking.openURL("https://fiat2defi.ch/")}
          label={t("general.homepage")}
        />

        <ActionLink
          style={AppStyles.ml10}
          onPress={() => Linking.openURL("https://t.me/DeFiChange")}
          label={t("general.telegram")}
        />

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

export default withSettings(withSession(Header));
