import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import AppLayout from "../components/AppLayout";
import { SpacerH, SpacerV } from "../elements/Spacers";
import { H2, H3 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";
import { useTranslation } from "react-i18next";
import { useDevice } from "../hooks/useDevice";
import Colors from "../config/Colors";
import Form from "../components/form/Form";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm, useWatch } from "react-hook-form";
import ButtonContainer from "../components/util/ButtonContainer";
import { DeFiButton } from "../elements/Buttons";
import { createRules } from "../utils/Utils";
import Validations from "../utils/Validations";
import Input from "../components/form/Input";
import IconButton from "../components/util/IconButton";
import { Dialog, Paragraph, Portal, Text } from "react-native-paper";
import ClipboardService from "../services/ClipboardService";
import { postLink } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import Routes from "../config/Routes";
import { signingCommand } from "../services/SignatureService";

interface Data {
  existingAddress: string;
  existingSignature: string;
  newAddress: string;
  newSignature: string;
}

const LinkScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const device = useDevice();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Data>();
  const existingAddress = useWatch({ control, name: "existingAddress", defaultValue: "" });
  const newAddress = useWatch({ control, name: "newAddress", defaultValue: "" });

  const [isProcessing, setIsProcessing] = useState(false);
  const [existingSignCommandCopied, setExistingSignCommandCopied] = useState(false);
  const [newSignCommandCopied, setNewSignCommandCopied] = useState(false);
  const [showsSuccess, setShowsSuccess] = useState(false);

  useEffect(() => {
    // get params
    const params = route.params as any;
    if (params && params.existing) setValue("existingAddress", params.existing);
    if (params && params.new) setValue("newAddress", params.new);
  }, []);

  const onSubmit = () => (data: Data) => {
    setIsProcessing(true);

    const link = {
      existing: {
        address: data.existingAddress,
        signature: data.existingSignature,
      },
      linkTo: {
        address: data.newAddress,
        signature: data.newSignature,
      },
    };

    postLink(link)
      .then(() => {
        setShowsSuccess(true);
      })
      .catch(() => {
        onLoadFailed();
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const goToHome = () => {
    setShowsSuccess(false);
    nav.navigate(Routes.Home);
  };

  const rules: any = createRules({
    existingAddress: [Validations.Required, Validations.Address],
    existingSignature: [Validations.Required, Validations.Signature],
    newAddress: [Validations.Required, Validations.Address],
    newSignature: [Validations.Required, Validations.Signature],
  });

  return (
    <AppLayout>
      <Portal>
        <Dialog visible={showsSuccess} onDismiss={() => setShowsSuccess(false)} style={AppStyles.dialog}>
          <Dialog.Content>
            <Paragraph>{t("link.success")}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <DeFiButton onPress={() => goToHome()}>{t("action.ok")}</DeFiButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View>
        <H2 text="Link a new address to your existing account" />
      </View>
      <SpacerV />
      <View
        style={
          device.SM
            ? [AppStyles.containerHorizontal, styles.pageContainer]
            : [{ flexDirection: "column" }, styles.pageContainer]
        }
      >
        <Form
          control={control}
          rules={rules}
          errors={errors}
          disabled={isProcessing}
          onSubmit={handleSubmit(onSubmit())}
        >
          <View style={[styles.addressContainer, styles.container]}>
            <H3 text="New address" />
            <SpacerV />
            <Input
              name="newAddress"
              label={t("model.user.legacy_address")}
              returnKeyType="next"
              blurOnSubmit={false}
              placeholder="8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG"
            />
            <View style={newAddress ? styles.container : AppStyles.noDisplay}>
              <SpacerV />
              <H3 text={t("session.signing_command")}></H3>
              <View style={[AppStyles.containerHorizontal, styles.signingMessage]}>
                <View style={styles.textContainer}>
                  <Text>{signingCommand(newAddress)}</Text>
                </View>
                <SpacerH />
                <IconButton
                  icon={newSignCommandCopied ? "check" : "content-copy"}
                  color={newSignCommandCopied ? Colors.Success : Colors.Grey}
                  onPress={() => {
                    ClipboardService.copy(signingCommand(newAddress));
                    setTimeout(() => setNewSignCommandCopied(true), 200);
                    setTimeout(() => setNewSignCommandCopied(false), 2200);
                  }}
                />
              </View>
              <SpacerV />
              <Input name="newSignature" label={t("model.user.signature")} returnKeyType="send" secureTextEntry />
            </View>
          </View>
          <IconButton icon="link" style={{ alignSelf: "center" }} />
          <View style={[styles.container, styles.addressContainer]}>
            <H3 text="Existing address" />
            <SpacerV />
            <Input
              name="existingAddress"
              label={t("model.user.legacy_address")}
              returnKeyType="next"
              blurOnSubmit={false}
              placeholder="8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG"
            />
            <View style={existingAddress ? styles.container : AppStyles.noDisplay}>
              <SpacerV />
              <H3 text={t("session.signing_command")}></H3>
              <View style={[AppStyles.containerHorizontal, styles.signingMessage]}>
                <View style={styles.textContainer}>
                  <Text>{signingCommand(existingAddress)}</Text>
                </View>
                <SpacerH />
                <IconButton
                  icon={existingSignCommandCopied ? "check" : "content-copy"}
                  color={existingSignCommandCopied ? Colors.Success : Colors.Grey}
                  onPress={() => {
                    ClipboardService.copy(signingCommand(existingAddress));
                    setTimeout(() => setExistingSignCommandCopied(true), 200);
                    setTimeout(() => setExistingSignCommandCopied(false), 2200);
                  }}
                />
              </View>
              <SpacerV />
              <Input
                name={"existingSignature"}
                label={t("model.user.signature")}
                returnKeyType="send"
                secureTextEntry
              />
            </View>
          </View>
        </Form>
      </View>
      <SpacerV />
      <ButtonContainer>
        <DeFiButton mode="contained" loading={isProcessing} onPress={handleSubmit(onSubmit())}>
          {t("action.link")}
        </DeFiButton>
      </ButtonContainer>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    alignItems: "flex-start",
    wordBreak: "break-word",
  },
  addressContainer: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.LightGrey,
    padding: 8,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  signingMessage: {
    padding: 8,
    borderColor: Colors.Grey,
    borderRadius: 5,
    backgroundColor: Colors.LightBlue,
  },
  textContainer: {
    flex: 1,
  },
});

export default LinkScreen;
