import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, Button, View } from "react-native";
import Form from "../components/Form";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Colors from "../config/Colors";
import { SpacerV } from "../elements/Spacers";
import AppStyles from "../styles/AppStyles";

interface LoginData {
  userName: string;
  password: string;
}

const LoginScreen = () => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginData>();

  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmit = (data: LoginData) => {
    setIsProcessing(true);
    // TODO
    console.log(data);
    setIsProcessing(false);
  };

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
      <View style={styles.formContainer}>
        <Form control={control} rules={rules} errors={errors} editable={!isProcessing}>
          <Input name="userName" label={t("model.user.address")} />
          <Input name="password" label={t("model.user.signature")} />
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
      {/* <TouchableWithoutFeedback onPress={() => SessionService.login().then(() => nav.navigate(Routes.Home))}>
        <Text>{t("action.login")}</Text>
      </TouchableWithoutFeedback> */}
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
