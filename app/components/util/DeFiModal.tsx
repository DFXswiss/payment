import React, { ReactElement } from "react";
import Modal from "modal-enhanced-react-native-web";
import { StyleSheet, View, TextStyle, ScrollView } from "react-native";
import Colors from "../../config/Colors";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import AppStyles from "../../styles/AppStyles";
import { Icon } from "react-native-elements";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { H2 } from "../../elements/Texts";

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
  children: ReactElement;
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
              <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                <Icon name="close" color={Colors.Grey} />
              </TouchableWithoutFeedback>
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
    backgroundColor: Colors.White,
  },
  scrollContainer: {
    padding: 15,
  },
});

export default DeFiModal;
