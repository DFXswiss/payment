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
import { createRules, openUrl } from "../utils/Utils";
import { ApiError } from "../models/ApiDto";
import StorageService from "../services/StorageService";
import Loading from "../components/util/Loading";
import { getSignMessage } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { Blockchain } from "../models/Blockchain";
import { ErrorScreenType } from "./ErrorScreen";
import { useAlby } from "../hooks/useAlby";
import { Environment } from "../env/Environment";

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
  const { isInstalled: isAlbyInstalled, enable: enableAlby, signMessage: signMessageWithAlby } = useAlby();

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
  const [isSignCommand, setIsSignCommand] = useState(false);
  const [signMessage, setSignMessage] = useState<string>();

  const passwordRef = useRef<TextInput>(null);

  const onSubmit = (direct: boolean) => (data: LoginData) => {
    if (!direct && !addressEntered) {
      setIsProcessing(true);
      getSignMessage(data.userName)
        .then(async (sign) => {
          let signMessage = sign.message;

          // DeFiChain special case
          if (sign.blockchains.includes(Blockchain.DEFICHAIN)) {
            signMessage = `signmessage "${data.userName}" "${signMessage}"`;
            setIsSignCommand(true);
          }

          setSignMessage(signMessage);

          // Lightning Alby login
          if (sign.blockchains.includes(Blockchain.LIGHTNING) && isAlbyInstalled) {
            const info = await enableAlby();
            if (info) {
              setIsAutoLogin(true);
              const signature = await signMessageWithAlby(signMessage);
              setValue("password", signature);

              return handleSubmit(onSubmit(true))();
            }
          }

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
    // update settings
    const headless = Boolean(params?.headless);
    const language = params?.lang?.toUpperCase();
    SettingsService.updateSettings({ headless }).then(() => {
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
        .catch(() => {
          nav.navigate(Routes.Error, { screenType: ErrorScreenType.LOGIN_FAILED });
        })
        .finally(() => {
          setIsProcessing(false);
          setIsAutoLogin(false);
        });
    }

    if (params?.address) {
      setValue("userName", params.address);

      setIsAutoLogin(true);

      // deprecated login with address & signature (TODO: remove)
      params.signature && setValue("password", params.signature);
      const directLogin = params.signature != null;

      handleSubmit(onSubmit(directLogin))();
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
      headless: undefined,
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

  const loginWithAlby = async () => {
    setIsProcessing(true);

    const info = await enableAlby();
    if (info?.node?.pubkey) {
      // log in with pub key
      setValue("userName", `LNNID${info.node.pubkey.toUpperCase()}`);
      return handleSubmit(onSubmit(false))();
    } else if (info?.node?.alias?.includes("getalby.com")) {
      // log in with Alby
      return openUrl(`${Environment.api.baseUrl}/alby?redirect_uri=${window.location.origin}/login`, false);
    }

    setIsProcessing(false);
    NotificationService.error(t("feedback.load_failed"));
  };

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
                  label={t("model.user.blockchain_address")}
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
                <ButtonContainer>
                  <DeFiButton mode="contained" loading={isProcessing} onPress={handleSubmit(onSubmit(false))}>
                    {t(addressEntered ? "action.login" : "action.next")}
                  </DeFiButton>
                </ButtonContainer>
              </Form>
            </View>
            {isAlbyInstalled && (
              <>
                <SpacerV height={50} />
                <ButtonContainer>
                  <DeFiButton mode="contained" onPress={loginWithAlby}>
                    {t("action.login_with", { provider: "Alby" })}
                  </DeFiButton>
                </ButtonContainer>
              </>
            )}
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
