import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { Portal, Snackbar } from "react-native-paper";
import Sizes from "../config/Sizes";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";
import Header from "./Header";

const AppLayout = ({ children }: { children: ReactElement | ReactElement[] }) => {
  const { t } = useTranslation();

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
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[AppStyles.container, styles.container]}>
          <View style={[AppStyles.container, styles.appContainer]}>
            <Header></Header>
            {children}

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
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    height: "100vh",
  },
  scrollContainer: {
    minHeight: "100%",
  },
  container: {
    alignItems: "center",
    padding: Sizes.AppPadding,
  },
  appContainer: {
    width: "100%",
    maxWidth: 800,
  },
  snackWrapper: {
    bottom: Sizes.AppPadding,
    alignItems: "center",
  },
  snack: {
    maxWidth: 500,
  },
});

export default AppLayout;
