import "./i18n/i18n";
import React, { useEffect, useState } from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import Routes from "./config/Routes";
import AppTheme from "./styles/AppTheme";
import { Paragraph, Portal, Provider, Snackbar } from "react-native-paper";
import { createDrawerNavigator } from "@react-navigation/drawer";
import GtcScreen from "./screens/GtcScreen";
import HomeScreen from "./screens/home/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import { navigationRef } from "./utils/NavigationHelper";
import { StyleSheet, View } from "react-native";
import HeaderContent from "./components/HeaderContent";
import Sizes from "./config/Sizes";
import { useDevice } from "./hooks/useDevice";
import NotificationService, { Level, Notification } from "./services/NotificationService";
import AppStyles from "./styles/AppStyles";
import AdminScreen from "./screens/AdminScreen";
import CfpScreen from "./screens/CfpScreen";
import Colors from "./config/Colors";
import IdentScreen from "./screens/IdentScreen";

const DrawerContent = () => {
  const device = useDevice();
  return (
    <>
      <View
        style={[
          { height: "100%", padding: Sizes.AppPadding, backgroundColor: Colors.LightBlue },
          device.SM && AppStyles.noDisplay,
        ]}
      >
        <HeaderContent />
      </View>
    </>
  );
};

const Main = () => {
  const drawer = createDrawerNavigator();
  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: Routes.Home,
      screens: {
        [Routes.Home]: "/",
        [Routes.Login]: "login",
        [Routes.Gtc]: "legal",
        [Routes.Cfp]: "cfp",
        [Routes.Admin]: "admin",
        [Routes.Ident]: "ident",
        [Routes.NotFound]: "*",
      },
    },
  };
  const screens = [
    { route: Routes.Home, screen: HomeScreen },
    { route: Routes.Login, screen: LoginScreen },
    { route: Routes.Gtc, screen: GtcScreen },
    { route: Routes.Cfp, screen: CfpScreen },
    { route: Routes.Admin, screen: AdminScreen },
    {route: Routes.Ident, screen: IdentScreen},
    { route: Routes.NotFound, screen: NotFoundScreen },
  ];

  const [snackVisible, setSnackVisible] = useState<boolean>(false);
  const [snackContent, setSnackContent] = useState<Notification>();

  useEffect(() => {
    const subscription = NotificationService.Notifications$.subscribe((notification) => {
      setSnackContent(notification);
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
            action={{ label: "", icon: "close", color: Colors.Grey }}
            duration={Snackbar.DURATION_MEDIUM}
            style={styles.snack}
            wrapperStyle={styles.snackWrapper}
          >
            <Paragraph style={{ color: snackContent?.level === Level.SUCCESS ? Colors.Success : Colors.Error }}>
              {snackContent?.text}
            </Paragraph>
          </Snackbar>
        </Portal>

        <NavigationContainer linking={linking} ref={navigationRef}>
          <drawer.Navigator screenOptions={{ headerShown: false }} drawerContent={() => <DrawerContent />}>
            {screens.map((screen) => (
              <drawer.Screen
                key={screen.route}
                name={screen.route}
                component={screen.screen}
                options={{ unmountOnBlur: true }}
              />
            ))}
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
