import React from "react";
import { Button, View, Image } from "react-native";
import colors from "../config/colors";
import routes from "../config/routes";
import * as navigation from "../utils/navigationHelper";

const Header = () => {
  return (
    <View style={{ flexDirection: "row", padding: 10 }}>
      <Image
        style={{ width: 190 }}
        source={require("../assets/logo_defichange.png")}
      />
      <Button
        color={colors.primary}
        title="Home"
        onPress={() => navigation.navigate(routes.home)}
      />
      <Button
        color={colors.primary}
        title="Sign up"
        onPress={() => navigation.navigate(routes.signUp)}
      />
    </View>
  );
};

export default Header;
