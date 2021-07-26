import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Linking } from "react-native";
import Routes from "../config/Routes";
import { DeFiButton } from "../elements/Buttons";
import { Environment } from "../env/Environment";
import withSession from "../hocs/withSession";
import withSettings from "../hocs/withSettings";
import { useDevice } from "../hooks/useDevice";
import { Language, Languages } from "../i18n/i18n";
import { Session } from "../services/AuthService";
import SessionService from "../services/SessionService";
import SettingsService, { AppSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import { navigate } from "../utils/NavigationHelper";
import DeFiDropdown from "./form/DeFiDropdown";

const getLanguage = (key: string): Language | undefined => Languages.find((l) => l.key === key);

const HeaderContent = ({ session, settings }: { session?: Session; settings?: AppSettings }) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [selectedLanguage, setSelectedLanguage] = useState(getLanguage(Environment.defaultLanguage));

  useEffect(() => {
    if (settings) {
      setSelectedLanguage(getLanguage(settings.language));
    }
  }, [settings]);

  const logout = () => SessionService.logout();
  const languageChanged = (update: SetStateAction<Language | undefined>) => {
    const language = typeof update === "function" ? update(selectedLanguage) : update;
    SettingsService.updateSettings({ language: language?.key });
  };

  const links = [
    { key: "general.wiki", url: "https://defichain-wiki.com/" },
    { key: "general.homepage", url: "https://fiat2defi.ch/" },
    { key: "general.telegram", url: "https://t.me/DeFiChange" },
  ];

  return (
    <View style={device.SM && AppStyles.containerHorizontal}>
      {session?.isLoggedIn && (
        <DeFiButton onPress={logout} style={styles.button} compact>
          {t("action.logout")}
        </DeFiButton>
      )}

      {links.map((link) => (
        <DeFiButton key={link.key} onPress={() => Linking.openURL(link.url)} style={styles.button} compact>
          {t(link.key)}
        </DeFiButton>
      ))}

      <DeFiDropdown
        value={selectedLanguage}
        setValue={languageChanged}
        items={Languages}
        idProp="key"
        labelProp="label"
        title={t("general.select_language")}
        style={styles.button}
      ></DeFiDropdown>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
  },
});

export default withSettings(withSession(HeaderContent));
