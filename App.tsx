import "react-native-gesture-handler";
import React from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./app/screens/home/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import Routes from "./app/config/Routes";
import "./app/i18n/i18n";
import NotFoundScreen from "./app/screens/NotFoundScreen";
import { navigationRef } from "./app/utils/NavigationHelper";
import GtcScreen from "./app/screens/GtcScreen";
import { Provider } from "react-native-paper";
import AppTheme from "./app/styles/AppTheme";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HeaderContent from "./app/components/HeaderContent";
import Sizes from "./app/config/Sizes";
import { View } from "react-native";
import { useDevice } from "./app/hooks/useDevice";
import RefScreen from "./app/screens/RefScreen";

const DrawerContent = () => {
  const device = useDevice();
  return (
    <>
      {!device.SM && (
        <View style={{ padding: Sizes.AppPadding }}>
          <HeaderContent />
        </View>
      )}
    </>
  );
};

const App = () => {
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
        [Routes.NotFound]: "*",
      },
    },
  };

  return (
    <Provider theme={AppTheme}>
      <NavigationContainer linking={linking} ref={navigationRef}>
        <drawer.Navigator screenOptions={{ headerShown: false }} drawerContent={(props) => <DrawerContent />}>
          <drawer.Screen name={Routes.Home} component={HomeScreen} />
          <drawer.Screen name={Routes.Login} component={LoginScreen} />
          <drawer.Screen name={Routes.Ref} component={RefScreen} />
          <drawer.Screen name={Routes.Gtc} component={GtcScreen} />
          <drawer.Screen name={Routes.NotFound} component={NotFoundScreen} />
        </drawer.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
