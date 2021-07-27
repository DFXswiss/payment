import "./i18n/i18n";
import React, { useEffect, useState } from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import Routes from "./config/Routes";
import AppTheme from "./styles/AppTheme";
import { Portal, Provider, Snackbar } from "react-native-paper";
import { createDrawerNavigator } from "@react-navigation/drawer";
import GtcScreen from "./screens/GtcScreen";
import HomeScreen from "./screens/home/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import RefScreen from "./screens/RefScreen";
import { navigationRef } from "./utils/NavigationHelper";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import HeaderContent from "./components/HeaderContent";
import Sizes from "./config/Sizes";
import { useDevice } from "./hooks/useDevice";
import NotificationService from "./services/NotificationService";
import AppStyles from "./styles/AppStyles";
import AdminScreen from "./screens/AdminScreen";

const DrawerContent = () => {
  const device = useDevice();
  return (
    <>
      <View style={[{ padding: Sizes.AppPadding }, device.SM && AppStyles.noDisplay]}>
        <HeaderContent />
      </View>
    </>
  );
};

const Main = () => {
  const { t } = useTranslation();

  const drawer = createDrawerNavigator();
  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: Routes.Home,
      screens: {
        [Routes.Home]: "/",
        [Routes.Login]: "login",
        [Routes.Ref]: "ref",
        [Routes.Gtc]: "legal",
        [Routes.Admin]: "admin",
        [Routes.NotFound]: "*",
      },
    },
  };
  const screens = [
    { route: Routes.Home, screen: HomeScreen },
    { route: Routes.Login, screen: LoginScreen },
    { route: Routes.Ref, screen: RefScreen },
    { route: Routes.Gtc, screen: GtcScreen },
    { route: Routes.Admin, screen: AdminScreen },
    { route: Routes.NotFound, screen: NotFoundScreen },
  ];

  const [snackVisible, setSnackVisible] = useState<boolean>(false);
  const [snackText, setSnackText] = useState<string>();

  useEffect(() => {
    const subscription = NotificationService.Notifications$.subscribe((text) => {
      setSnackText(text);
      setSnackVisible(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Provider theme={AppTheme}>
      <Portal.Host>
        <Portal>
          <Snackbar
            visible={snackVisible}
            onDismiss={() => setSnackVisible(false)}
            action={{ label: t("action.close") }}
            duration={Snackbar.DURATION_MEDIUM}
            style={styles.snack}
            wrapperStyle={styles.snackWrapper}
          >
            {snackText}
          </Snackbar>
        </Portal>

        <NavigationContainer linking={linking} ref={navigationRef}>
          <drawer.Navigator screenOptions={{ headerShown: false }} drawerContent={() => <DrawerContent />}>
            {screens.map((screen) => <drawer.Screen key={screen.route} name={screen.route} component={screen.screen} options={{ unmountOnBlur: true }} />)}
          </drawer.Navigator>
        </NavigationContainer>
      </Portal.Host>
    </Provider>
  );
};

const styles = StyleSheet.create({
  snackWrapper: {
    bottom: Sizes.AppPadding,
    alignItems: "center",
  },
  snack: {
    maxWidth: 500,
  },
});

export default Main;
