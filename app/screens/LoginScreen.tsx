import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, TextInput } from "react-native";
import Form from "../components/form/Form";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { SpacerH, SpacerV } from "../elements/Spacers";
import { Alert, H1, H3 } from "../elements/Texts";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";
import Input from "../components/form/Input";
import AppLayout from "../components/AppLayout";
import IconButton from "../components/util/IconButton";
import ClipboardService from "../services/ClipboardService";
import Validations from "../utils/Validations";
import { Text } from "react-native-paper";
import SettingsService from "../services/SettingsService";
import { DeFiButton } from "../elements/Buttons";
import ButtonContainer from "../components/util/ButtonContainer";
import { createRules } from "../utils/Utils";
import { ApiError } from "../models/ApiDto";
import StorageService from "../services/StorageService";
import Loading from "../components/util/Loading";
import { getSignMessage } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { Blockchain } from "../models/Blockchain";

interface LoginData {
  userName: string;
  password: string;
  walletId: number;
  refCode: string;
}

const LoginScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<LoginData>();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>();
  const [addressEntered, setAddressEntered] = useState(false);
  const [signCommandCopied, setSignCommandCopied] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isOldSignature, setIsOldSignature] = useState(false);
  const [isSignCommand, setIsSignCommand] = useState(false);
  const [signMessage, setSignMessage] = useState<string>();

  const passwordRef = useRef<TextInput>(null);

  const onSubmit = (direct: boolean) => (data: LoginData) => {
    if (!direct && !addressEntered) {
      setIsProcessing(true);
      getSignMessage(data.userName)
        .then((sign) => {
          let signMessage = sign.message;
          if (sign.blockchains.includes(Blockchain.DEFICHAIN)) {
            signMessage = `signmessage "${data.userName}" "${signMessage}"`;
            setIsSignCommand(true);
          }
          setSignMessage(signMessage);
          setAddressEntered(true);
          passwordRef.current?.focus();
          setIsProcessing(false);
        })
        .catch(() => {
          setAddressEntered(false);
          setIsProcessing(false);
          NotificationService.error(t("feedback.load_failed"));
        });
      return;
    }

    setAddressEntered(true);
    setIsProcessing(true);
    setError(undefined);

    const credentials = { address: data.userName, signature: data.password };

    SessionService.login(credentials)
      .finally(() => {
        setIsProcessing(false);
        setIsAutoLogin(false);
      })
      .then(() => nav.navigate(Routes.Home))
      .catch((error: ApiError) => {
        // store the credentials for sign up
        Promise.all([
          StorageService.storeValue(StorageService.Keys.Credentials, credentials),
          data.walletId ? StorageService.storeValue(StorageService.Keys.WalletId, data.walletId) : Promise.resolve(0),
          data.refCode ? StorageService.storeValue(StorageService.Keys.Ref, data.refCode) : Promise.resolve(""),
        ]).then(() => {
          switch (error.statusCode) {
            case 400:
              setError("session.pattern_invalid");
              break;
            case 401:
              setError("session.signature_invalid");
              break;
            case 404:
              // new user
              nav.navigate(Routes.Gtc);
              break;
            default:
              setError("");
          }
        });
      });
  };

  useEffect(() => {
    // TODO: remove at some point ...
    setIsOldSignature(false);

    // update settings
    const isIframe = Boolean(params?.iframe);
    const language = params?.lang?.toUpperCase();
    SettingsService.updateSettings({ isIframe }).then(() => {
      if (language) SettingsService.updateSettings({ language });
    });

    // TODO: remove 0 -> 1 conversion (fix for DFX Wallet v0.10.5)
    setValue("walletId", params?.walletId == 0 ? 1 : +params?.walletId);
    setValue("refCode", params?.code);

    // token login
    if (params?.token) {
      setIsAutoLogin(true);
      setIsProcessing(true);

      resetParams();

      SessionService.tokenLogin(params?.token)
        .then(() => nav.navigate(Routes.Home))
        .catch(() => {})
        .finally(() => {
          setIsProcessing(false);
          setIsAutoLogin(false);
        });
    }

    // deprecated login with address & signature (TODO: remove)
    if (params?.address && params?.signature) {
      setValue("userName", params.address);
      setValue("password", params.signature);
      setIsAutoLogin(true);

      // TODO: remove at some point ...
      if (params?.signature?.length != 88) {
        setIsOldSignature(true);
        setAddressEntered(true);
      } else {
        handleSubmit(onSubmit(true))();
      }
    }

    resetParams();
  }, []);

  const resetParams = () => {
    nav.navigate(Routes.Login, {
      lang: undefined,
      address: undefined,
      signature: undefined,
      walletId: undefined,
      code: undefined,
      iframe: undefined,
      token: undefined,
    });
  };

  const addressValueHook = (value: string): string => {
    if (addressEntered && signMessage) {
      setAddressEntered(false);
      setIsSignCommand(false);
      reset();
    }
    return value;
  };

  const params = route.params as any;
  const rules: any = createRules({
    userName: [Validations.Required, Validations.Address],
    password: addressEntered && [Validations.Required, Validations.Signature],
  });

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        {isProcessing && isAutoLogin ? (
          <>
            <SpacerV height={50} />
            <Loading size="large" />
          </>
        ) : (
          <>
            <H1 text={t("session.sign_up")} />
            <SpacerV />
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
                  valueHook={addressValueHook}
                  blurOnSubmit={false}
                  placeholder="8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG"
                />
                <View style={addressEntered ? undefined : AppStyles.noDisplay}>
                  <SpacerV />
                  <H3 text={t(isSignCommand ? "session.signing_command" : "session.signing_message")}></H3>
                  <View style={[AppStyles.containerHorizontal, styles.signingMessage]}>
                    <View style={styles.textContainer}>
                      <Text>{signMessage}</Text>
                    </View>
                    <SpacerH />
                    <IconButton
                      icon={signCommandCopied ? "check" : "content-copy"}
                      color={signCommandCopied ? Colors.Success : Colors.Grey}
                      onPress={() => {
                        if (!signMessage) return;
                        ClipboardService.copy(signMessage);
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
                    <Alert label={`${t("session.login_failed")} ${error ? t(error) : ""}`} />
                    <SpacerV />
                  </>
                )}
                {isOldSignature && (
                  <>
                    <Alert label={t("session.old_signature")} />
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
          </>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
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

export default LoginScreen;
