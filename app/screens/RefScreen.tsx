import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Paragraph, Portal, Text, Button } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Routes from "../config/Routes";
import { ActionLink, DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import AppStyles from "../styles/AppStyles";

const RefScreen = () => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const proceed = () => {
    nav.navigate(Routes.Gtc);
  };

  return (
    <AppLayout>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Content>
            <Paragraph>Dieses Feature wird momentan noch nicht unterstützt!</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>{t("action.ok")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Text>TODO: enter a ref code</Text>

      <SpacerV />

      <View style={AppStyles.containerHorizontal}>
        <ActionLink label={t("ref.continue_without_ref")} onPress={() => setDialogVisible(true)} />
        <View style={AppStyles.mla}>
          <DeFiButton mode="contained" onPress={proceed}>
            {t("action.next")}
          </DeFiButton>
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  dialog: {
    marginHorizontal: "auto",
    maxWidth: 300,
  },
});

export default RefScreen;
