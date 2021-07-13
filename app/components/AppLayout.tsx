import React, { createRef, ReactNode, RefObject, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Portal, Snackbar } from "react-native-paper";
import Sizes from "../config/Sizes";
import NotificationService from "../services/NotificationService";
import ScrollService from "../services/ScrollService";
import AppStyles from "../styles/AppStyles";
import Header from "./Header";

export const scrollRef: RefObject<ScrollView> = createRef();

// TODO: button style on mobile
const AppLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const windowHeight = useWindowDimensions().height;

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
    <View style={{ height: windowHeight }}>
      <Portal.Host>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          ref={scrollRef}
          onScroll={(event) => ScrollService.ScrollPosition = event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y - windowHeight}
          scrollEventThrottle={100}
        >
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
      </Portal.Host>
    </View>
  );
};

const styles = StyleSheet.create({
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
