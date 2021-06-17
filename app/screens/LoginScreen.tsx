import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, Button, View } from "react-native";
import Form from "../components/Form";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Colors from "../config/Colors";
import Routes from "../config/Routes";
import { SpacerV } from "../elements/Spacers";
import { Alert, H2 } from "../elements/Texts";
import SessionService from "../services/SessionService";
import AppStyles from "../styles/AppStyles";
import VideoPlayer from "../components/VideoPlayer";
import { Environment } from "../env/Environment";
import { changeLanguage } from "../i18n/i18n";

interface LoginData {
  userName: string;
  password: string;
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
  } = useForm<LoginData>();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = (data: LoginData) => {
    setIsProcessing(true);
    setError(false);

    if (Environment.debug && data.userName === "admin") {
      data = {
        userName: "8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG",
        password: "Hwj3sJjBxMOnkPxZkGtqinGdASIOM6ffGDCcQsWA7kRIIjMP5/HMyuZwlLnBKuD6weD5c/8HIzMrmi6GpCmFU04=",
      };
    }

    SessionService.login({ address: data.userName, signature: data.password })
      .finally(() => setIsProcessing(false))
      .then(() => nav.navigate(Routes.Home))
      .catch(() => setError(true));
  };

  useEffect(() => {
    const params = route.params as any;
    if (params?.lang) {
      changeLanguage(params.lang);
    }
    if (params?.address && params?.signature) {
      setValue("userName", params.address);
      setValue("password", params.signature);
      handleSubmit(onSubmit)();
    }
  }, []);

  const rules: any = {
    userName: {
      required: {
        value: true,
        message: t("validation.required"),
      },
    },
    password: {
      required: {
        value: true,
        message: t("validation.required"),
      },
    },
  };

  return (
    <View style={[AppStyles.container, styles.container]}>
      <SpacerV height={20} />
      <VideoPlayer src="https://www.youtube.com/embed/DubUrIPFajA" maxWidth={600} />
      <SpacerV height={30} />

      <H2 text={t("sign_up")} />
      <View style={styles.formContainer}>
        <Form control={control} rules={rules} errors={errors} editable={!isProcessing} onSubmit={handleSubmit(onSubmit)}>
          <Input name="userName" label={t("model.user.address")} returnKeyType="next" />
          <Input name="password" label={t("model.user.signature")} />
          <SpacerV />
          <>{error && <Alert label={t("feedback.login_failed")} />}</>
          <SpacerV />
          <View style={[AppStyles.containerHorizontal, AppStyles.mla]}>
            <View style={isProcessing && AppStyles.hidden}>
              <Button
                color={Colors.Primary}
                title={t("action.login")}
                onPress={handleSubmit(onSubmit)}
                disabled={isProcessing}
              />
            </View>
            <>{isProcessing && <Loading />}</>
          </View>
        </Form>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
});

export default LoginScreen;
