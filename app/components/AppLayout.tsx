import React, { createRef, ReactNode, RefObject, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { FAB, Portal, Snackbar } from "react-native-paper";
import Sizes from "../config/Sizes";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";
import Header from "./Header";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const dimensions = useWindowDimensions();

  const [snackVisible, setSnackVisible] = useState<boolean>(false);
  const [snackText, setSnackText] = useState<string>();
  const [contentSize, setContentSize] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  useEffect(() => {
    const subscription = NotificationService.Notifications$.subscribe((text) => {
      setSnackText(text);
      setSnackVisible(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollPosition = contentSize - contentOffset - dimensions.height;
  const scrollRef: RefObject<ScrollView> = createRef();

  return (
    <View style={{ height: dimensions.height }}>
      <Portal.Host>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          ref={scrollRef}
          onContentSizeChange={(_, height) => setContentSize(height)}
          onScroll={(scrollEvent) => setContentOffset(scrollEvent.nativeEvent.contentOffset.y)}
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
                {contentSize > 2000 && scrollPosition > 250 && (
                  <FAB
                    icon="chevron-down"
                    style={[styles.fab, { right: Math.max(0, (dimensions.width - Sizes.AppWidth) / 2) }]}
                    onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                  />
                )}
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
    maxWidth: Sizes.AppWidth,
  },
  snackWrapper: {
    bottom: Sizes.AppPadding,
    alignItems: "center",
  },
  snack: {
    maxWidth: 500,
  },
  fab: {
    position: "absolute",
    margin: 16,
    bottom: 0,
  },
});

export default AppLayout;
