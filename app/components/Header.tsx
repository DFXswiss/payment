import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Routes from "../config/Routes";
import AppStyles from "../styles/AppStyles";
import withSession from "../hocs/withSession";
import { Session } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import { useDevice } from "../hooks/useDevice";
import HeaderContent from "./HeaderContent";

const Header = ({ session }: { session?: Session }) => {
  const device = useDevice();
  const nav = useNavigation<DrawerNavigationProp<any>>();

  const goHome = () => nav.navigate(session?.isLoggedIn ? Routes.Home : Routes.Login);

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      {!device.SM && <IconButton icon="menu" onPress={() => nav.toggleDrawer()} style={AppStyles.mra} />}

      <TouchableOpacity activeOpacity={1} style={styles.logoTouch} onPress={goHome}>
        <Image style={styles.logo} source={require("../assets/logo_defichange.png")} />
      </TouchableOpacity>

      <View style={[AppStyles.mla, !device.SM && AppStyles.noDisplay]}>
        <HeaderContent />
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
});

export default withSession(Header);
