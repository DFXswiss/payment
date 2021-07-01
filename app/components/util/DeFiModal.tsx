import React, { ReactElement, ReactNode } from "react";
import Modal from "modal-enhanced-react-native-web";
import { StyleSheet, View, TextStyle, ScrollView } from "react-native";
import Colors from "../../config/Colors";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { H2 } from "../../elements/Texts";
import IconButton from "./IconButton";

const DeFiModal = ({
  isVisible,
  setIsVisible,
  style,
  title,
  save,
  children,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  style?: TextStyle;
  title: string;
  save?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation();

  // TODO: close on escape
  return (
    <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
      <View style={[styles.container, style]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[AppStyles.containerHorizontal]}>
            <H2 text={title} style={AppStyles.mr20} />
            <View style={AppStyles.mla}>
              <IconButton type="material" icon="close" color={Colors.Grey} onPress={() => setIsVisible(false)} />
            </View>
          </View>
          <SpacerV />
          {children}

          {/* TODO: default close buttons? */}
          {/* <Spacer />
          <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
            <Button color={Colors.LightGrey} title={t("action.abort")} onPress={() => setIsVisible(false)} />
            <View style={AppStyles.ml10}>
              <Button color={Colors.Primary} title={save} onPress={() => setIsVisible(false)} />
            </View>
          </View> */}
        </ScrollView>
      </View>
    </Modal>
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
});

export default DeFiModal;
