import React, { ReactNode } from "react";
import { StyleSheet, View, TextStyle, ScrollView } from "react-native";
import Colors from "../../config/Colors";
import { SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { H2 } from "../../elements/Texts";
import IconButton from "./IconButton";
import { Modal, Portal } from "react-native-paper";

const DeFiModal = ({
  isVisible,
  setIsVisible,
  style,
  title,
  children,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  style?: TextStyle;
  title: string;
  children: ReactNode;
}) => {
  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={() => setIsVisible(false)}
        contentContainerStyle={[styles.container, style]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[AppStyles.containerHorizontal]}>
            <H2 text={title} style={AppStyles.mr20} />
            <View style={AppStyles.mla}>
              <IconButton
                icon="close"
                color={Colors.Grey}
                onPress={() => setIsVisible(false)}
                style={styles.closeIcon}
              />
            </View>
          </View>
          <SpacerV />
          {children}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: "auto",
    maxHeight: "90vh",
    maxWidth: "100%",
    backgroundColor: Colors.White,
  },
  scrollContainer: {
    padding: 15,
  },
  closeIcon: {
    marginTop: -10,
    marginRight: -10,
  },
});

export default DeFiModal;
