import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import Form from "../components/form/Form";
import Input from "../components/form/Input";
import ButtonContainer from "../components/util/ButtonContainer";
import Loading from "../components/util/Loading";
import Routes from "../config/Routes";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useGuard from "../hooks/useGuard";
import { getRefCode } from "../services/ApiService";
import { Credentials, Session } from "../services/AuthService";
import StorageService from "../services/StorageService";
import AppStyles from "../styles/AppStyles";
import { createRules } from "../utils/Utils";
import Validations from "../utils/Validations";

const RefScreen = ({ session }: { session?: Session }) => {
  const nav = useNavigation();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(true);

  useGuard(() =>
    StorageService.getValue<Credentials>(StorageService.Keys.Credentials)
      .then((credentials) => !(credentials.address && credentials.signature))
  );
  useGuard(() => session && session.isLoggedIn, [session], Routes.Home);

  useEffect(() => {
    getRefCode()
      .then((ref) => onSubmit({ usedRef: ref }))
      .catch(() => setIsLoading(false));
  }, []);

  const onSubmit = ({ usedRef }: { usedRef: string | null }) => {
    StorageService.storeValue(StorageService.Keys.Ref, usedRef).then(() => nav.navigate(Routes.Gtc));
  };

  const rules: any = createRules({
    usedRef: [Validations.Required, Validations.Ref],
  });

  return (
    <AppLayout>
      <SpacerV height={20} />

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          <H1 style={AppStyles.center} text={t("model.user.ref")} />
          <SpacerV height={20} />

          <View style={AppStyles.alignCenter}>
            <View style={AppStyles.singleColFormContainer}>
              <Form control={control} rules={rules} errors={errors} onSubmit={handleSubmit(onSubmit)}>
                {/* TODO: auto-format for all ref inputs */}
                <Input name="usedRef" label={t("model.user.ref")} placeholder="xxx-xxx" />

                <SpacerV />

                <ButtonContainer>
                  <DeFiButton link onPress={() => onSubmit({ usedRef: null })}>
                    {t("ref.continue_without_ref")}
                  </DeFiButton>
                  <DeFiButton mode="contained" onPress={handleSubmit(onSubmit)}>
                    {t("action.next")}
                  </DeFiButton>
                </ButtonContainer>
              </Form>
            </View>
          </View>
        </>
      )}
    </AppLayout>
  );
};

export default withSession(RefScreen);
