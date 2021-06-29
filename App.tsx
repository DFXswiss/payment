import "react-native-gesture-handler";
import React from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./app/screens/home/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import Routes from "./app/config/Routes";
import "./app/i18n/i18n";
import NotFoundScreen from "./app/screens/NotFoundScreen";
import { navigationRef } from "./app/utils/NavigationHelper";
import GtcScreen from "./app/screens/GtcScreen";
import { Provider } from "react-native-paper";
import AppTheme from "./app/styles/AppTheme";

const App = () => {
  const stack = createStackNavigator();
  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: Routes.Home,
      screens: {
        [Routes.Home]: "/",
        [Routes.Login]: "login",
        [Routes.Gtc]: "legal",
        [Routes.NotFound]: "*",
      },
    },
  };

  return (
    <Provider theme={AppTheme}>
      <NavigationContainer linking={linking} ref={navigationRef}>
        <stack.Navigator screenOptions={{ headerShown: false }}>
          <stack.Screen name={Routes.Home} component={HomeScreen}></stack.Screen>
          <stack.Screen name={Routes.Login} component={LoginScreen}></stack.Screen>
          <stack.Screen name={Routes.Gtc} component={GtcScreen}></stack.Screen>
          <stack.Screen name={Routes.NotFound} component={NotFoundScreen}></stack.Screen>
        </stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
