import "react-native-gesture-handler";
import React from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./app/screens/HomeScreen";
import SignUpScreen from "./app/screens/SignUpScreen";
import Header from "./app/components/Header";
import routes from "./app/config/routes";
import { navigationRef } from "./app/utils/navigationHelper";

export default function App() {
  const Stack = createStackNavigator();

  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: routes.home,
      screens: {
        [routes.home]: "/",
        [routes.signUp]: "sign-up",
      },
    },
  };

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Header></Header>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={routes.home} component={HomeScreen}></Stack.Screen>
        <Stack.Screen name={routes.signUp} component={SignUpScreen}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
