import React, { useState, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { KycState, KycStatus, User, UserRole, UserStatus } from "../../models/User";
import { getUserDetail, postKyc } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import { DataTable, Dialog, FAB, Paragraph, Portal, TextInput } from "react-native-paper";
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
import ClipboardService from "../../services/ClipboardService";
import { ApiError } from "../../models/ApiDto";
import { useForm } from "react-hook-form";
import Validations from "../../utils/Validations";
import Input from "../../components/form/Input";
import Form from "../../components/form/Form";
import IconButton from "../../components/util/IconButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import RefFeeEdit from "../../components/edit/RefFeeEdit";

const formatAmount = (amount?: number): string => amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? "";

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const device = useDevice();
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
  const [isRefFeeEdit, setIsRefFeeEdit] = useState(false);

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

  const continueKyc = () => {
    setLoading(true);
    postKyc()
      .then(() => NotificationService.success(t("feedback.request_submitted")))
      .then(() => getUserDetail())
      .then(setUser)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setLoading(false));
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

  const onRefFeeChanged = (fee: number): void => {
    if (user) user.refData.refFee = fee;
    setIsRefFeeEdit(false);
  };

  const userDataComplete = () =>
    user?.firstName &&
    user?.lastName &&
    user?.street &&
    user?.houseNumber &&
    user?.zip &&
    user?.location &&
    user?.country &&
    user?.mobileNumber &&
    user?.mail;

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
            .catch((e: ApiError) =>
              // auto logout
              e.statusCode != 401 ? NotificationService.error(t("feedback.load_failed")) : undefined
            )
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
    { icon: "account-edit", label: t("model.user.data"), onPress: () => setIsUserEdit(true), visible: true },
    {
      icon: "account-check",
      label: t("model.kyc.increase"),
      onPress: onKyc,
      visible:
        user?.status != UserStatus.NA &&
        (user?.kycStatus === KycStatus.NA ||
          user?.kycStatus === KycStatus.WAIT_VERIFY_MANUAL ||
          user?.kycStatus === KycStatus.COMPLETED),
    },
    {
      icon: "account-check",
      label: t("model.kyc.continue"),
      onPress: continueKyc,
      visible: user?.status != UserStatus.NA && user?.kycState === KycState.FAILED,
    },
    { icon: "plus", label: t("model.route.buy"), onPress: () => setIsBuyRouteEdit(true), visible: true },
    { icon: "plus", label: t("model.route.sell"), onPress: () => sellRouteEdit(true), visible: true },
  ];

  useAuthGuard(session);

  const limit = (user: User): string => {
    if (user.kycStatus != KycStatus.COMPLETED && user.kycStatus != KycStatus.WAIT_VERIFY_MANUAL) {
      return `${formatAmount(900)} € ${t("model.user.per_day")}`;
    } else {
      return `${formatAmount(user.depositLimit)} € ${t("model.user.per_year")}`;
    }
  };

  const userData = (user: User) => [
    { condition: Boolean(user.address), label: "model.user.address", value: user.address },
    {
      condition: Boolean(user.firstName || user.lastName),
      label: "model.user.name",
      value: join([user.firstName, user.lastName], " "),
    },
    {
      condition: Boolean(user.street || user.houseNumber),
      label: "model.user.home",
      value: join([user.street, user.houseNumber], " "),
    },
    { condition: Boolean(user.zip), label: "model.user.zip", value: user.zip },
    { condition: Boolean(user.location), label: "model.user.location", value: user.location },
    { condition: Boolean(user.country), label: "model.user.country", value: user.country?.name },
    { condition: Boolean(user.mail), label: "model.user.mail", value: user.mail },
    { condition: Boolean(user.mobileNumber), label: "model.user.mobile_number", value: user.mobileNumber },
    { condition: Boolean(user.usedRef), label: "model.user.used_ref", value: user.usedRef },
    {
      condition: true,
      label: "model.user.buy_fee",
      value: `${user.fees.buy}%` + (user.fees.refBonus ? ` (${user.fees.refBonus}% ${t("model.user.ref_bonus")})` : ""),
    },
    { condition: true, label: "model.user.sell_fee", value: `${user.fees.sell}%` },
    {
      condition: Boolean(user.userVolume.buyVolume),
      label: "model.user.user_buy_volume",
      value: `${formatAmount(user.userVolume.buyVolume)} €`,
    },
    {
      condition: Boolean(user.userVolume.sellVolume),
      label: "model.user.user_sell_volume",
      value: `${formatAmount(user.userVolume.sellVolume)} €`,
    },
    {
      condition: user.kycStatus != KycStatus.NA,
      label: "model.kyc.status",
      value: t(`model.kyc.${user.kycStatus.toLowerCase()}`),
    },
    { condition: true, label: "model.user.limit", value: limit(user) },
  ];

  const refData = (user: User) => [
    {
      condition: Boolean(user.refData.ref),
      label: "model.user.own_ref",
      value: user.refData.ref,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(`${RefUrl}${user?.refData.ref}`),
    },
    {
      condition: Boolean(user.refData.ref),
      label: "model.user.ref_commission",
      value: `${user.refData.refFee}%`,
      icon: [UserRole.BETA, UserRole.Admin].includes(session?.role ?? UserRole.Unknown) ? "chevron-right" : undefined,
      onPress: () => setIsRefFeeEdit(true),
    },
    { condition: Boolean(user.refData.refCount), label: "model.user.ref_count", value: user.refData.refCount },
    {
      condition: Boolean(user.refData.refCountActive),
      label: "model.user.ref_count_active",
      value: user.refData.refCountActive,
    },
    {
      condition: Boolean(user.refData.refVolume),
      label: "model.user.ref_volume",
      value: `${formatAmount(user.refData.refVolume)} €`,
    },
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
            <DeFiButton onPress={() => setIsKycRequest(false)} color={Colors.Grey}>
              {t("action.abort")}
            </DeFiButton>
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

      <DeFiModal
        isVisible={isRefFeeEdit}
        setIsVisible={setIsRefFeeEdit}
        title={t("model.user.ref_commission_edit")}
        style={{ width: 400 }}
      >
        <RefFeeEdit
          currentRefFee={user?.refData.refFee ?? 0}
          onRefFeeChanged={onRefFeeChanged}
          onCancel={() => setIsRefFeeEdit(false)}
        />
      </DeFiModal>

      <SpacerV height={50} />

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          {user && (
            <View>
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
                    {user?.status != UserStatus.NA && user?.kycState === KycState.FAILED && (
                      <View style={AppStyles.mr10}>
                        <DeFiButton mode="contained" onPress={continueKyc}>
                          {t("model.kyc.continue")}
                        </DeFiButton>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {refData(user).some((d) => d.condition) && (
                <>
                  <SpacerV height={50} />
                  <H2 text={t("model.user.your_ref_data")} />
                  <SpacerV />
                  <DataTable>
                    {refData(user).map(
                      (d) =>
                        d.condition && (
                          <TouchableOpacity onPress={d.onPress} key={d.label} disabled={!d.icon || device.SM}>
                            <CompactRow>
                              <CompactCell multiLine style={{ flex: 2 }}>
                                {t(d.label)}
                              </CompactCell>
                              <CompactCell>{d.value}</CompactCell>
                              <CompactCell style={{ flex: undefined }}>
                                <IconButton
                                  icon={d.icon ?? ""}
                                  onPress={device.SM ? d.onPress : undefined}
                                  disabled={!d.icon}
                                />
                              </CompactCell>
                            </CompactRow>
                          </TouchableOpacity>
                        )
                    )}
                  </DataTable>
                </>
              )}
            </View>
          )}

          <SpacerV height={50} />

          {(buyRoutes || sellRoutes) && (
            <RouteList
              buyRoutes={buyRoutes}
              setBuyRoutes={setBuyRoutes}
              sellRoutes={sellRoutes}
              setSellRoutes={setSellRoutes}
              isBuyRouteEdit={isBuyRouteEdit}
              setIsBuyRouteEdit={setIsBuyRouteEdit}
              isSellRouteEdit={isSellRouteEdit && !isUserEdit}
              setIsSellRouteEdit={sellRouteEdit}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default withSession(HomeScreen);
