import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useRef, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, TextInput, Linking } from "react-native";
import Form from "../components/form/Form";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { SpacerH, SpacerV } from "../elements/Spacers";
import { Alert, H2, H3 } from "../elements/Texts";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";
import VideoPlayer from "../components/util/VideoPlayer";
import { Environment } from "../env/Environment";
import Input from "../components/form/Input";
import AppLayout from "../components/AppLayout";
import IconButton from "../components/util/IconButton";
import Clipboard from "expo-clipboard";
import Validations from "../utils/Validations";
import { Text } from "react-native-paper";
import SettingsService from "../services/SettingsService";
import { DeFiButton } from "../elements/Buttons";
import ButtonContainer from "../components/util/ButtonContainer";
import { createRules } from "../utils/Utils";
import { ApiError } from "../models/ApiDto";

interface LoginData {
  userName: string;
  password: string;
}

const signingCommand = (address: string) => {
  const message = `By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID: ${address}`
      .split(" ")
      .join("_");
  return `signmessage "${address}" "${message}"`;
};
const DefaultWalletId = 1;

const LoginScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginData>();
  const address = useWatch({ control, name: "userName", defaultValue: "" });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>();
  const [addressEntered, setAddressEntered] = useState(false);
  const [signCommandCopied, setSignCommandCopied] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const onSubmit = (direct: boolean) => (data: LoginData) => {
    if (!direct && !addressEntered) {
      setAddressEntered(true);
      passwordRef.current?.focus();
      return;
    }

    setIsProcessing(true);
    setError(undefined);

    if (Environment.debug && data.userName === "admin") {
      data = {
        userName: "8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG",
        password: "Hwj3sJjBxMOnkPxZkGtqinGdASIOM6ffGDCcQsWA7kRIIjMP5/HMyuZwlLnBKuD6weD5c/8HIzMrmi6GpCmFU04=",
      };
    }

    const walletId = +(params?.walletId ?? DefaultWalletId);

    SessionService.login({ address: data.userName, signature: data.password, walletId: walletId })
      .finally(() => setIsProcessing(false))
      .then(() => nav.navigate(Routes.Home))
      .catch((error: ApiError) => {
        switch (error.statusCode) {
          case 400:
            setError("session.pattern_invalid");
            break;
          case 401:
            setError("session.signature_invalid");
            break;
          case 404:
            // new user
            nav.navigate(Routes.Ref);
            break;
          default:
            setError("");
        }
      });
  };

  const openInstructions = () => Linking.openURL(t("session.instruction_link"));

  useEffect(() => {
    if (params?.lang) {
      SettingsService.updateSettings({ language: params.lang });
    }

    if (params?.address && params?.signature) {
      setValue("userName", params.address);
      setValue("password", params.signature);
      handleSubmit(onSubmit(true))();
    }
  }, []);

  const params = route.params as any;
  const rules: any = createRules({
    userName: [Validations.Required, Validations.Address],
    password: addressEntered && Validations.Required,
  });

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <SpacerV height={20} />
        <VideoPlayer src="https://www.youtube.com/embed/0C50S1GhBu8" maxWidth={600} />
        <SpacerV />
        <DeFiButton onPress={openInstructions} compact>
          {t("session.instructions")}
        </DeFiButton>

        <SpacerV height={30} />
        <H2 text={t("session.sign_up")} />
        <View style={AppStyles.singleColFormContainer}>
          <Form
            control={control}
            rules={rules}
            errors={errors}
            disabled={isProcessing}
            onSubmit={handleSubmit(onSubmit(false))}
          >
            <Input
              name="userName"
              label={t("model.user.legacy_address")}
              returnKeyType="next"
              blurOnSubmit={false}
              placeholder="8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG"
            />

            <View style={addressEntered ? undefined : AppStyles.noDisplay}>
              <SpacerV />
              <H3 text={t("session.signing_command")}></H3>

              <View style={[AppStyles.containerHorizontal, styles.signingMessage]}>
                <View style={styles.textContainer}>
                  <Text>{signingCommand(address)}</Text>
                </View>
                <SpacerH />
                <IconButton
                  icon={signCommandCopied ? "check" : "content-copy"}
                  color={signCommandCopied ? Colors.Success : Colors.Grey}
                  onPress={() => {
                    Clipboard.setString(signingCommand(address));
                    setTimeout(() => setSignCommandCopied(true), 200);
                    setTimeout(() => setSignCommandCopied(false), 2200);
                  }}
                />
              </View>
              <SpacerV />
              <Input
                name="password"
                label={t("model.user.signature")}
                returnKeyType="send"
                ref={passwordRef}
                secureTextEntry
              />
            </View>

            <SpacerV />

            {error != null && (
              <>
                <Alert label={`${t("session.login_failed")} ${t(error)}`} />
                <SpacerV />
              </>
            )}

            <ButtonContainer>
              <DeFiButton mode="contained" loading={isProcessing} onPress={handleSubmit(onSubmit(false))}>
                {t(addressEntered ? "action.login" : "action.next")}
              </DeFiButton>
            </ButtonContainer>
          </Form>
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  signingMessage: {
    padding: 8,
    borderColor: Colors.Grey,
    borderRadius: 5,
    backgroundColor: Colors.LightGrey,
  },
  textContainer: {
    flex: 1,
  },
});

export default LoginScreen;
