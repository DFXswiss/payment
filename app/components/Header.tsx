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
import { tailwind } from "@tailwind";

const Logo = ({ session }: { session?: Session }) => {
  const nav = useNavigation<DrawerNavigationProp<any>>();
  const goHome = () => nav.navigate(session?.isLoggedIn ? Routes.Home : Routes.Login);

  return (
    <TouchableOpacity activeOpacity={1} style={styles.logoTouch} onPress={goHome}>
      <Image style={styles.logo} source={require("../assets/logo.jpg")} />
    </TouchableOpacity>
  );
};

const Header = ({ session }: { session?: Session }) => {
  const device = useDevice();
  const nav = useNavigation<DrawerNavigationProp<any>>();

  const backNavigationRoute = "";

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      {device.SM ? (
        <>
          <Logo session={session} />
          <View style={[AppStyles.container, !device.SM && AppStyles.noDisplay]}>
            <HeaderContent />
          </View>
        </>
      ) : (
        <View style={tailwind('flex-1 flex-row justify-between items-center')}>
          <View style={!backNavigationRoute && AppStyles.hidden}>
            <IconButton icon="chevron-left" onPress={() => nav.navigate(backNavigationRoute)} style={AppStyles.mra} />
          </View>
          <View>
            <Logo session={session} />
          </View>
          <View>
            <IconButton icon="menu" onPress={() => nav.toggleDrawer()} style={AppStyles.mra} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  logoTouch: {
    width: 80,
    height: 30,
  },
  logo: {
    flex: 1,
    resizeMode: "contain",
  },
});

export default withSession(Header);
