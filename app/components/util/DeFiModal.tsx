import React, { ReactNode } from "react";
import { StyleSheet, View, TextStyle, ScrollView } from "react-native";
import Colors from "../../config/Colors";
import { SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { H2 } from "../../elements/Texts";
import IconButton from "./IconButton";
import { Modal, Portal, Text } from "react-native-paper";

const DeFiModal = ({
  isVisible,
  setIsVisible,
  style,
  title,
  children,
  isBeta,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  style?: TextStyle;
  title: string;
  children: ReactNode;
  isBeta?: boolean;
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
            {isBeta ? (
              <>
                <H2 text={title} />
                <View style={styles.betaContainer}>
                  <Text style={styles.beta}> Beta</Text>
                </View>
              </>
            ) : (
              <H2 text={title} style={AppStyles.mr20} />
            )}
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
    maxWidth: "90vw",
    backgroundColor: Colors.Blue,
  },
  scrollContainer: {
    padding: 15,
  },
  closeIcon: {
    marginTop: -10,
    marginRight: -10,
  },
  betaContainer: {
    alignItems: "flex-start",
    height: "100%",
  },
  beta: {
    fontSize: 12,
    marginTop: 6,
  },
});

export default DeFiModal;
