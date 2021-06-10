import React from "react";
import { Button, View, Image, TouchableOpacity } from "react-native";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import * as navigation from "../utils/NavigationHelper";

const Header = () => {
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
    </View>
  );
};

export default Header;
