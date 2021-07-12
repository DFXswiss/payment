import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, Linking } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { ActionLink } from "../elements/Buttons";
import { Environment } from "../env/Environment";
import withSession from "../hocs/withSession";
import withSettings from "../hocs/withSettings";
import { useDevice } from "../hooks/useDevice";
import { Session } from "../services/AuthService";
import SessionService from "../services/SessionService";
import SettingsService, { AppSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import { navigate } from "../utils/NavigationHelper";

const HeaderContent = ({ session, settings }: { session?: Session; settings?: AppSettings }) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [selectedLanguage, setSelectedLanguage] = useState(Environment.defaultLanguage);

  useEffect(() => {
    if (settings) {
      setSelectedLanguage(settings.language);
    }
  }, [settings]);

  const logout = () => SessionService.logout().then(() => navigate(Routes.Login));
  const languageChanged = (language: string) => {
    SettingsService.updateSettings({ language: language });
  };

  const margin = device.SM ? AppStyles.ml10 : AppStyles.mt10;

  return (
    <View style={device.SM && [AppStyles.containerHorizontal, { alignItems: "baseline" }]}>
      {session?.isLoggedIn && <ActionLink onPress={logout} label={t("action.logout")} />}

      <ActionLink
        style={margin}
        onPress={() => Linking.openURL("https://defichain-wiki.com/")}
        label={t("general.wiki")}
      />

      <ActionLink
        style={margin}
        onPress={() => Linking.openURL("https://fiat2defi.ch/")}
        label={t("general.homepage")}
      />

      <ActionLink
        style={margin}
        onPress={() => Linking.openURL("https://t.me/DeFiChange")}
        label={t("general.telegram")}
      />

      {/* TODO: dropdown? */}
      {/* <DropDown
        value={selectedLanguage}
        setValue={(value) => languageChanged(`${value}`)}
        list={[{label: "Deutsch", value: "de"}, {label: "English", value: "en"}]}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        inputProps={{
          right: <TextInput.Icon name={"menu-down"} />,
          dense: true,
          underlineColor: "white",
          style: {color: Colors.Primary, backgroundColor: "white", maxWidth: 120}
        }}
      /> */}
      <Picker
        style={[margin, styles.languageSelect]}
        selectedValue={selectedLanguage}
        onValueChange={(itemValue, itemIndex) => languageChanged(itemValue)}
      >
        <Picker.Item label="Deutsch" value="de" />
        <Picker.Item label="English" value="en" />
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  languageSelect: {
    color: Colors.Primary,
    borderColor: Colors.Primary,
  },
});

export default withSettings(withSession(HeaderContent));
