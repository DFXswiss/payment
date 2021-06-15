import React, { ReactElement } from "react";
import Modal from "modal-enhanced-react-native-web";
import { StyleSheet, View, Text } from "react-native";
import Colors from "../config/Colors";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../elements/Elements";
import AppStyles from "../styles/AppStyles";

const DeFiModal = ({
  isVisible,
  setIsVisible,
  minWidth = 0,
  title,
  save,
  children,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  minWidth?: number;
  title: string;
  save: string;
  children: ReactElement;
}) => {
  const { t } = useTranslation();

  // TODO: close on escape
  return (
    <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
      <View style={[styles.container, { minWidth: minWidth }]}>
        <Text style={AppStyles.h2}>{title}</Text>
        {/* TODO: close icon? */}
        <SpacerV />
        {children}
        {/* TODO: default close buttons? */}
        {/* <Spacer />
        <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
          <Button color={Colors.Secondary} title={t("action.abort")} onPress={() => setIsVisible(false)} />
          <View style={AppStyles.ml10}>
            <Button color={Colors.Primary} title={save} onPress={() => setIsVisible(false)} />
          </View>
        </View> */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: "auto",
    padding: 15,
    backgroundColor: Colors.White,
  },
});

export default DeFiModal;
