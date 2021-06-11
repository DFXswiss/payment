import "react-native-gesture-handler";
import React from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./app/screens/HomeScreen";
import SignUpScreen from "./app/screens/SignUpScreen";
import Header from "./app/components/Header";
import Routes from "./app/config/Routes";
import { navigationRef } from "./app/utils/NavigationHelper";
import "./app/i18n/i18n";
import { View, StyleSheet } from "react-native";
import AppStyles from "./app/styles/AppStyles";
import Sizes from "./app/config/Sizes";

const App = () => {
  const stack = createStackNavigator();
  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: Routes.Home,
      screens: {
        [Routes.Home]: "/",
        [Routes.SignUp]: "sign-up",
      },
    },
  };

  // TODO: max width
  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Header></Header>
      <View style={[AppStyles.container, styles.container]}>
        <stack.Navigator screenOptions={{ headerShown: false }}>
          <stack.Screen name={Routes.Home} component={HomeScreen}></stack.Screen>
          <stack.Screen name={Routes.SignUp} component={SignUpScreen}></stack.Screen>
        </stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Sizes.AppPadding
  }
})

export default App;