import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import i18n, { changeLanguage } from "../i18n/i18n";
import * as nav from "../utils/NavigationHelper";
import { Picker } from "@react-native-picker/picker";
import { getSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import { useTranslation } from "react-i18next";
import SessionService, { Credentials } from "../services/SessionService";
import withCredentials from "../hocs/withSession";
import { ActionLink } from "../elements/Texts";

const Header = ({ credentials }: { credentials?: Credentials }) => {
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState("de");

  useEffect(() => {
    // get language from settings
    getSettings().then((settings) => {
      setSelectedLanguage(settings.language);
      i18n.changeLanguage(settings.language);
    });
  }, []);

  const logout = () => SessionService.logout().then(() => nav.navigate(Routes.Login));

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      <TouchableOpacity activeOpacity={1} style={styles.logoTouch} onPress={() => nav.navigate(Routes.Home)}>
        <Image style={styles.logo} source={require("../assets/logo_defichange.png")} />
      </TouchableOpacity>

      <View style={[AppStyles.containerHorizontal, AppStyles.mla, {alignItems: "baseline"}]}>
        {credentials?.isLoggedIn && <ActionLink action={() => logout()} label={t("action.logout")} />}

        <Picker
          style={[AppStyles.ml10, styles.languageSelect]}
          selectedValue={selectedLanguage}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedLanguage(itemValue);
            changeLanguage(itemValue);
          }}
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

export default withCredentials(Header);
