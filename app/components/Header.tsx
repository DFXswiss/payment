import React from "react";
import { useTranslation } from "react-i18next";
import { Button, View, Image, TouchableOpacity } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import * as navigation from "../utils/NavigationHelper";

const Header = () => {
  const { t, i18n } = useTranslation();

  return (
    <View style={{ flexDirection: "row", padding: 10 }}>
      <TouchableOpacity activeOpacity={1} style={{ width: 200 }} onPress={() => navigation.navigate(Routes.Home)}>
        <Image
          style={{ flex: 1, resizeMode: "contain" }}
          source={require("../assets/logo_defichange.png")}
        />
      </TouchableOpacity>
      <Button
        color={Colors.Primary}
        title="Home"
        onPress={() => navigation.navigate(Routes.Home)}
      />
      <Button
        color={Colors.Primary}
        title="Sign up"
        onPress={() => navigation.navigate(Routes.SignUp)}
      />
      <Button
        color={Colors.Primary}
        title={t('change_language')}
        onPress={() => i18n.changeLanguage('de')}
      />
    </View>
  );
};

export default Header;
