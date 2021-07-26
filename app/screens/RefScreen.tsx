import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Paragraph, Portal, Button } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Form from "../components/form/Form";
import Input from "../components/form/Input";
import ButtonContainer from "../components/util/ButtonContainer";
import Routes from "../config/Routes";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { Credentials, Session } from "../services/AuthService";
import StorageService from "../services/StorageService";
import AppStyles from "../styles/AppStyles";
import Validations from "../utils/Validations";

const allowedRefCodes = ["000-000", "000-001", "000-002", "000-003", "000-004"];

const RefScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [dialogVisible, setDialogVisible] = useState(false);

  
  useGuard(() =>
    StorageService.getValue<Credentials>(StorageService.Keys.Credentials)
      .then((credentials) => !(credentials.address && credentials.signature))
  );
  useGuard(() => session && session.isLoggedIn, [session], Routes.Home);

  const onSubmit = ({ usedRef }: { usedRef: string }) => {
    StorageService.storeValue(StorageService.Keys.Ref, usedRef).then(() => nav.navigate(Routes.Gtc));
  };

  const rules: any = {
    usedRef: {
      ...Validations.Required(t),
      ...Validations.Ref(t),
      validate: (ref: string) => (allowedRefCodes.find((c) => c === ref) ? true : t("validation.invalid_ref")),
    },
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

      <SpacerV height={20} />
      <H1 style={AppStyles.center} text={t("model.user.ref")} />
      <SpacerV height={20} />

      <View style={AppStyles.alignCenter}>
        <View style={AppStyles.singleColFormContainer}>
          <Form control={control} rules={rules} errors={errors} onSubmit={handleSubmit(onSubmit)}>
            {/* TODO: auto-format for all ref inputs */}
            <Input name="usedRef" label={t("model.user.ref")} placeholder="xxx-xxx" />

            <SpacerV />

            <ButtonContainer>
              <DeFiButton link onPress={() => setDialogVisible(true)}>
                {t("ref.continue_without_ref")}
              </DeFiButton>
              <DeFiButton mode="contained" onPress={handleSubmit(onSubmit)}>
                {t("action.next")}
              </DeFiButton>
            </ButtonContainer>
          </Form>
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

export default withSession(RefScreen);
