import React, { useState, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View, Image } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { KycStatus, User, UserRole, UserStatus } from "../../models/User";
import { getUserDetail, postKyc } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import { Button, DataTable, Dialog, FAB, Paragraph, Portal, TextInput } from "react-native-paper";
import { CompactCell, CompactRow } from "../../elements/Tables";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import useLoader from "../../hooks/useLoader";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { createRules, join, resolve } from "../../utils/Utils";
import useAuthGuard from "../../hooks/useAuthGuard";
import Colors from "../../config/Colors";
import { Environment } from "../../env/Environment";
import Clipboard from "expo-clipboard";
import { ApiError } from "../../models/ApiDto";
import { useForm } from "react-hook-form";
import Validations from "../../utils/Validations";
import Input from "../../components/form/Input";
import Form from "../../components/form/Form";

const formatAmount = (amount?: number): string => amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? "";

const BringAFriendScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const device = useDevice();
  const BaseUrl = Environment.api.baseUrl;
  const RefUrl = Environment.api.refUrl;
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [buyRoutes, setBuyRoutes] = useState<BuyRoute[]>();
  const [sellRoutes, setSellRoutes] = useState<SellRoute[]>();
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);
  const [isKycRequest, setIsKycRequest] = useState(false);
  const [isKycLoading, setIsKycLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<{ limit: string }>();

  const rules: any = createRules({
    limit: [Validations.Required, Validations.Custom((val: string) => (+val ? true : "validation.pattern_invalid"))],
  });

  const sellRouteEdit = (update: SetStateAction<boolean>) => {
    if (!userDataComplete() && resolve(update, isSellRouteEdit)) {
      setIsUserEdit(true);
    }

    setIsSellRouteEdit(update);
  };
  const userEdit = (edit: boolean) => {
    setIsUserEdit(edit);
    if (!edit) {
      setIsSellRouteEdit(false);
      setIsKycRequest(false);
    }
  };
  const onUserChanged = (newUser: User) => {
    setUser(newUser);
    setIsUserEdit(false);
  };
  const onKyc = () => {
    if (user?.kycStatus === KycStatus.NA && !userDataComplete()) {
      setIsUserEdit(true);
    }
    resetForm();
    setIsKycRequest(true);
  };

  const requestKyc = ({ limit }: { limit?: string }): void => {
    setIsKycLoading(true);

    const limitNumber = limit ? +limit : undefined;
    postKyc(limitNumber)
      .then(() => {
        if (user?.kycStatus == KycStatus.NA) {
          user.kycStatus = KycStatus.WAIT_CHAT_BOT;
        }
        NotificationService.success(t("feedback.request_submitted"));
      })
      .catch(() => NotificationService.error(t("feedback.request_failed")))
      .finally(() => {
        setIsKycRequest(false);
        setIsKycLoading(false);
      });
  };

  const userDataComplete = () => user?.firstName && user?.lastName && user?.street && user?.houseNumber && user?.zip && user?.location && user?.country && user?.mobileNumber && user?.mail;

  const reset = (): void => {
    setLoading(true);
    setUser(undefined);
    setBuyRoutes(undefined);
    setSellRoutes(undefined);
    setIsUserEdit(false);
  };

  useLoader(
    (cancelled) => {
      if (session) {
        if (session.isLoggedIn) {
          getUserDetail()
            .then((user) => {
              if (!cancelled()) {
                setUser(user);
                setBuyRoutes(user.buys);
                setSellRoutes(user.sells);
              }
            })
            .catch((e: ApiError) => e.statusCode != 401 ? NotificationService.error(t("feedback.load_failed")) : undefined) // auto logout
            .finally(() => {
              if (!cancelled()) {
                setLoading(false);
              }
            });
        } else {
          reset();
        }
      }
    },
    [session]
  );

  const showButtons = (user && !isLoading && !device.SM) ?? false;
  const fabButtons = [
    { icon: "content-copy", label: t("model.user.copy_ref"), onPress: () => Clipboard.setString(`${RefUrl}${user?.refData.ref}`), visible: user?.refData?.ref },
    { icon: "account-edit", label: t("model.user.data"), onPress: () => setIsUserEdit(true), visible: true },
    { icon: "account-check", label: t("model.kyc.increase"), onPress: onKyc, visible: user?.status != UserStatus.NA && (user?.kycStatus === KycStatus.NA || user?.kycStatus === KycStatus.WAIT_VERIFY_MANUAL || user?.kycStatus === KycStatus.COMPLETED )},
    { icon: "plus", label: t("model.route.buy"), onPress: () => setIsBuyRouteEdit(true), visible: true },
    { icon: "plus", label: t("model.route.sell"), onPress: () => sellRouteEdit(true), visible: session?.role === UserRole.BETA || session?.role === UserRole.Admin }, // TODO: for all users
  ];

  useAuthGuard(session);

  const limit = (user: User): string => {
    if(user.kycStatus != KycStatus.COMPLETED && user.kycStatus != KycStatus.WAIT_VERIFY_MANUAL) {
      return `${formatAmount(900)} € ${t("model.user.per_day")}`
    } else {
      return `${formatAmount(user.depositLimit)} € ${t("model.user.per_year")}`;
    }
  };

  const userData = (user: User) => [
    { condition: Boolean(user.address), label: "model.user.address", value: user.address },
    { condition: Boolean(user.firstName || user.lastName), label: "model.user.name", value: join([user.firstName, user.lastName], " ") },
    { condition: Boolean(user.street || user.houseNumber), label: "model.user.home", value: join([user.street, user.houseNumber], " ") },
    { condition: Boolean(user.zip), label: "model.user.zip", value: user.zip },
    { condition: Boolean(user.location), label: "model.user.location", value: user.location },
    { condition: Boolean(user.country), label: "model.user.country", value: user.country?.name },
    { condition: Boolean(user.mail), label: "model.user.mail", value: user.mail },
    { condition: Boolean(user.mobileNumber), label: "model.user.mobile_number", value: user.mobileNumber },
    { condition: Boolean(user.usedRef), label: "model.user.used_ref", value: user.usedRef },
    { condition: Boolean(user.refData.ref), label: "model.user.own_ref", value: user.refData.ref },
    { condition: Boolean(user.refData.refCount), label: "model.user.ref_count", value: user.refData.refCount },
    { condition: Boolean(user.refData.refCountActive), label: "model.user.ref_count_active", value: user.refData.refCountActive },
    { condition: Boolean(user.refData.refVolume), label: "model.user.ref_volume", value: `${formatAmount(user.refData.refVolume)} €` },
    { condition: Boolean(user.userVolume.buyVolume), label: "model.user.user_buy_volume", value: `${formatAmount(user.userVolume.buyVolume)} €` },
    { condition: Boolean(user.userVolume.sellVolume), label: "model.user.user_sell_volume", value: `${formatAmount(user.userVolume.sellVolume)} €` },
    { condition: user.kycStatus != KycStatus.NA, label: "model.kyc.status", value:  t(`model.kyc.${user.kycStatus.toLowerCase()}`) },
    { condition: true, label: "model.user.buy_limit", value: limit(user) },
  ];

  return (
    <AppLayout>
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? "close" : "pencil"}
          actions={fabButtons.filter((b) => b.visible)}
          onStateChange={({ open }: { open: boolean }) => setFabOpen(open)}
          visible={showButtons}
        />

        <Dialog visible={isKycRequest && !isUserEdit} onDismiss={() => setIsKycRequest(false)} style={AppStyles.dialog}>
          <Dialog.Content>
            {user?.kycStatus === KycStatus.NA ? (
              <Paragraph>{t("model.kyc.request")}</Paragraph>
            ) : (
              <>
                <Paragraph>{t("model.kyc.invest_volume")}</Paragraph>
                <SpacerV />
                <Form
                  control={control}
                  rules={rules}
                  errors={errors}
                  disabled={isKycLoading}
                  onSubmit={handleSubmit(requestKyc)}
                >
                  <Input
                    name="limit"
                    label={t("model.kyc.volume")}
                    type="number"
                    right={<TextInput.Affix text="€" />}
                  />
                </Form>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsKycRequest(false)} color={Colors.Grey}>
              {t("action.abort")}
            </Button>
            <DeFiButton
              onPress={user?.kycStatus === KycStatus.NA ? requestKyc : handleSubmit(requestKyc)}
              loading={isKycLoading}
            >
              {t(user?.kycStatus === KycStatus.NA ? "action.yes" : "action.send")}
            </DeFiButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <DeFiModal isVisible={isUserEdit} setIsVisible={userEdit} title={t("model.user.edit")} style={{ width: 500 }}>
        <UserEdit user={user} onUserChanged={onUserChanged} allDataRequired={isSellRouteEdit || isKycRequest} />
      </DeFiModal>

      <SpacerV height={50} />

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          {user && (
            <View>
              <Image source={require("../../assets/bring-a-friend.jpeg")} />
              <View style={[AppStyles.containerHorizontal]}>
                <H2 text={t("model.user.your_data")} />
                <View style={{ marginLeft: "auto" }}>
                  <DeFiButton mode="contained" onPress={() => setIsUserEdit(true)}>
                    {t("action.edit")}
                  </DeFiButton>
                </View>
              </View>
              <SpacerV />
              <DataTable>
                {userData(user).map(
                  (d) =>
                    d.condition && (
                      <CompactRow key={d.label}>
                        <CompactCell>{t(d.label)}</CompactCell>
                        <CompactCell style={{ flex: device.SM ? 2 : 1 }}>{d.value}</CompactCell>
                      </CompactRow>
                    )
                )}
              </DataTable>
              <SpacerV />
              <View style={AppStyles.mr10}>
                {device.SM && (
                  <View style={[AppStyles.mra, AppStyles.containerHorizontal]}>
                    {user?.refData?.ref && (
                      <View style={AppStyles.mr10}>
                        <DeFiButton
                          mode="contained"
                          onPress={() => Clipboard.setString(`${RefUrl}${user.refData.ref}`)}
                        >
                          {t("model.user.copy_ref")}
                        </DeFiButton>
                      </View>
                    )}
                    {user?.status != UserStatus.NA &&
                      (user?.kycStatus === KycStatus.NA ||
                        user?.kycStatus === KycStatus.WAIT_VERIFY_MANUAL ||
                        user?.kycStatus === KycStatus.COMPLETED) && (
                        <View style={AppStyles.mr10}>
                          <DeFiButton mode="contained" onPress={onKyc}>
                            {t("model.kyc.increase")}
                          </DeFiButton>
                        </View>
                      )}
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default withSession(BringAFriendScreen);
