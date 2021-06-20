import React, { ReactElement } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Sizes from "../config/Sizes";
import AppStyles from "../styles/AppStyles";
import Header from "./Header";

const AppLayout = ({ children }: {children: ReactElement | ReactElement[]}) => {
  return (
    <View style={[AppStyles.container, styles.container]}>
      <View style={[AppStyles.container, styles.appContainer]}>
        <Header></Header>
        <ScrollView>{children}</ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: Sizes.AppPadding },
  appContainer: { width: "100%", maxWidth: 800 },
});

export default AppLayout;