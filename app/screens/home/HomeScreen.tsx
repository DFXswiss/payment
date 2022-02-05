import React, { useState, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2, H3 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { AccountType, KycStatus, User, UserDetail } from "../../models/User";
import { getRoutes, getUserDetail, postFounderCertificate, postKyc } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import { DataTable, Dialog, Paragraph, Portal, TextInput, Text } from "react-native-paper";
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
import { navigate } from "../../utils/NavigationHelper";
import Routes from "../../config/Routes";
import { StakingRoute } from "../../models/StakingRoute";
import withSettings from "../../hocs/withSettings";
import { AppSettings } from "../../services/SettingsService";
import * as DocumentPicker from "expo-document-picker";
import { DrawerContentScrollView } from "@react-navigation/drawer";

const formatAmount = (amount?: number): string => amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? "";

const HomeScreen = ({ session, settings }: { session?: Session; settings?: AppSettings }) => {
  const { t } = useTranslation();
  const device = useDevice();
  const RefUrl = Environment.api.refUrl;
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail>();
  const [buyRoutes, setBuyRoutes] = useState<BuyRoute[]>();
  const [sellRoutes, setSellRoutes] = useState<SellRoute[]>();
  const [stakingRoutes, setStakingRoutes] = useState<StakingRoute[]>();
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);
  const [isStakingRouteEdit, setIsStakingRouteEdit] = useState(false);
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

  const stakingRouteEdit = (update: SetStateAction<boolean>) => {
    if (
      ![KycStatus.WAIT_VERIFY_MANUAL, KycStatus.COMPLETED].includes(user?.kycStatus ?? KycStatus.NA) &&
      resolve(update, isStakingRouteEdit)
    ) {
      user?.kycStatus === KycStatus.NA ? onKyc() : continueKyc();
      return;
    }

    // reload all routes after close (may impact sell routes)
    if (!resolve(update, isStakingRouteEdit)) {
      loadRoutes();
    }

    setIsStakingRouteEdit(update);
  };

  const userEdit = (edit: boolean) => {
    setIsUserEdit(edit);
    if (!edit) {
      setIsSellRouteEdit(false);
      setIsKycRequest(false);
    }
  };

  const onUserChanged = (newUser: UserDetail) => {
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

  const onKycRequested = (url: string | undefined) => {
    if (user) {
      if (
        [KycStatus.NA, KycStatus.WAIT_CHAT_BOT, KycStatus.WAIT_VERIFY_ONLINE, KycStatus.WAIT_VERIFY_VIDEO].includes(
          user.kycStatus
        )
      ) {
        if (url) {
          navigate(Routes.OnBoarding, { url, kycStatus: user.kycStatus });
        } else {
          NotificationService.success(t("feedback.check_mails"));
        }
      } else {
        NotificationService.success(t("feedback.request_submitted"));
      }
    }
  };

  const continueKyc = () => {
    setLoading(true);
    postKyc()
      .then(onKycRequested)
      .catch(() => NotificationService.error(t("feedback.request_failed")))
      .finally(() => setLoading(false));
  };

  const requestKyc = ({ limit }: { limit?: string }): void => {
    setIsKycLoading(true);
    const limitNumber = limit ? +limit : undefined;
    postKyc(limitNumber)
      .then(onKycRequested)
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
    user?.mail &&
    (user?.accountType === AccountType.PERSONAL ||
      (user?.organizationName &&
        user?.organizationStreet &&
        user?.organizationHouseNumber &&
        user?.organizationLocation &&
        user?.organizationZip &&
        user?.organizationCountry));

  const reset = (): void => {
    setLoading(true);
    setUser(undefined);
    setBuyRoutes(undefined);
    setSellRoutes(undefined);
    setIsUserEdit(false);
  };

  const loadRoutes = (): Promise<void> => {
    return getRoutes().then((routes) => {
      setBuyRoutes(routes.buy);
      setSellRoutes(routes.sell);
      setStakingRoutes(routes.staking);
    });
  };

  useLoader(
    (cancelled) => {
      if (session) {
        if (session.isLoggedIn) {
          Promise.all([getUserDetail(), loadRoutes()])
            .then(([user, _]) => {
              if (!cancelled()) {
                setUser(user);
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

  useAuthGuard(session);

  const limit = (user: User): string => {
    if (user.kycStatus != KycStatus.COMPLETED && user.kycStatus != KycStatus.WAIT_VERIFY_MANUAL) {
      return `${formatAmount(900)} € ${t("model.user.per_day")}`;
    } else {
      return `${formatAmount(user.depositLimit)} € ${t("model.user.per_year")}`;
    }
  };

  const buyVolume = () => (buyRoutes ?? []).reduce((prev, curr) => prev + curr.volume, 0);
  const annualBuyVolume = () => (buyRoutes ?? []).reduce((prev, curr) => prev + curr.annualVolume, 0);
  const sellVolume = () => (sellRoutes ?? []).reduce((prev, curr) => prev + curr.volume, 0);

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
    { condition: true, label: "model.user.mail", value: user.mail, emptyHint: t("model.user.add_mail") },
    { condition: Boolean(user.mobileNumber), label: "model.user.mobile_number", value: user.mobileNumber },
    { condition: Boolean(user.usedRef), label: "model.user.used_ref", value: user.usedRef },
    {
      condition: Boolean(buyVolume()),
      label: "model.user.buy_volume",
      value: `${formatAmount(buyVolume())} €`,
    },
    {
      condition: Boolean(annualBuyVolume()),
      label: "model.user.annual_buy_volume",
      value: `${formatAmount(annualBuyVolume())} €`,
    },
    {
      condition: Boolean(sellVolume()),
      label: "model.user.sell_volume",
      value: `${formatAmount(sellVolume())} €`,
    },
    {
      condition: user.kycStatus != KycStatus.NA,
      label: "model.kyc.status",
      value: t(`model.kyc.${user.kycStatus.toLowerCase()}`),
      icon: [KycStatus.WAIT_VERIFY_VIDEO, KycStatus.WAIT_CHAT_BOT, KycStatus.WAIT_VERIFY_ONLINE].includes(
        user.kycStatus
      )
        ? "reload"
        : undefined,
      onPress: continueKyc,
    },
    {
      condition: true,
      label: "model.user.limit",
      value: limit(user),
      icon:
        user.kycStatus === KycStatus.NA ||
        user.kycStatus === KycStatus.WAIT_VERIFY_MANUAL ||
        user.kycStatus === KycStatus.COMPLETED
          ? "arrow-up"
          : undefined,
      onPress: onKyc,
    },
  ];


  
    const uploadFounderCertificate = () : void=> {
      
      DocumentPicker.getDocumentAsync({ type: "public.item", multiple: false })
        .then((result) => {
          setIsKycRequest(false);
          setLoading(true);
          if (result.type === "success") {
            const files: File[] = [...Array(result.output?.length).keys()]
              .map((i) => result.output?.item(i))
              .filter((f) => f != null)
              .map((f) => f as File);
            return files;
          }
          throw new Error();
        })
        .then(postFounderCertificate)
        .then(() => {
          NotificationService.success(t("feedback.save_successful"));
          return requestKyc({limit:undefined});
        }
        )
        .catch(() => NotificationService.error(t("feedback.file_error")));     
    };
  
  const organizationData = (user: User) => [
    { condition: Boolean(user.organizationName), label: "model.user.organization_name", value: user.organizationName },
    {
      condition: Boolean(user.organizationStreet || user.organizationHouseNumber),
      label: "model.user.home",
      value: join([user.organizationStreet, user.organizationHouseNumber], " "),
    },
    { condition: Boolean(user.organizationZip), label: "model.user.zip", value: user.organizationZip },
    { condition: Boolean(user.organizationLocation), label: "model.user.location", value: user.organizationLocation },
    {
      condition: Boolean(user.organizationCountry),
      label: "model.user.country",
      value: user.organizationCountry?.name,
    },
  ];

  const refData = (user: UserDetail) => [
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
      icon: "chevron-right",
      onPress: () => setIsRefFeeEdit(true),
    },
    { condition: Boolean(user.refData.refCount), label: "model.user.ref_count", value: user.refData.refCount },
    {
      condition: Boolean(user.refData.refCountActive),
      label: "model.user.ref_count_active",
      value: user.refData.refCountActive,
    },
    {
      condition: Boolean(user.refVolume),
      label: "model.user.ref_volume",
      value: `${formatAmount(user.refVolume)} €`,
    },
  ];

  return (
    <AppLayout>
      <Portal>
        <Dialog visible={isKycRequest && !isUserEdit} onDismiss={() => setIsKycRequest(false)} style={AppStyles.dialog}>
          <Dialog.Content>
            {user?.kycStatus === KycStatus.NA ? 
            user?.accountType !== AccountType.PERSONAL ? 
              <>
                <Paragraph>{t("model.kyc.upload_incorporation_certificate")}</Paragraph>
                <SpacerV />
              </>
              :
            (
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
              onPress={user?.kycStatus === KycStatus.NA ? user?.accountType !== AccountType.PERSONAL? uploadFounderCertificate : requestKyc : handleSubmit(requestKyc)}
              loading={isKycLoading}
            >
              {t(user?.kycStatus === KycStatus.NA ? user?.accountType !== AccountType.PERSONAL?  "action.upload" : "action.yes" : "action.send")}
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

      {!settings?.isIframe && <SpacerV height={30} />}

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          {user && (
            <View>
              <View style={[AppStyles.containerHorizontal]}>
                <H2 text={t("model.user.your_data")} />
                {device.SM && (
                  <View style={[AppStyles.mla, AppStyles.containerHorizontal]}>
                    <View>
                      <DeFiButton mode="contained" onPress={() => setIsUserEdit(true)}>
                        {t("action.edit")}
                      </DeFiButton>
                    </View>
                  </View>
                )}
              </View>
              <SpacerV />
              <DataTable>
                {userData(user).map(
                  (d) =>
                    d.condition && (
                      <TouchableOpacity onPress={d.onPress} key={d.label} disabled={!d.icon || device.SM}>
                        <CompactRow>
                          <CompactCell multiLine>{t(d.label)}</CompactCell>
                          <View style={{ flex: device.SM ? 2 : 1, flexDirection: "row" }}>
                            <CompactCell multiLine>
                              <Text style={!d.value && { color: Colors.Yellow }}>
                                {d.value ? d.value : d.emptyHint}
                              </Text>
                            </CompactCell>
                            {d.icon && (
                              <CompactCell style={{ flex: undefined }}>
                                <IconButton icon={d.icon} onPress={device.SM ? d.onPress : undefined} />
                              </CompactCell>
                            )}
                          </View>
                        </CompactRow>
                      </TouchableOpacity>
                    )
                )}
              </DataTable>
              <SpacerV />

              {user.accountType !== AccountType.PERSONAL && organizationData(user).some((d) => d.condition) && (
                <>
                  <H3 text={t("model.user.organization_info")} />
                  <DataTable>
                    {organizationData(user).map(
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
                </>
              )}

              {!device.SM && (
                <>
                  <DeFiButton mode="contained" onPress={() => setIsUserEdit(true)}>
                    {t("action.edit")}
                  </DeFiButton>
                </>
              )}

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
                              <CompactCell multiLine style={{ flex: 3 }}>
                                {t(d.label)}
                              </CompactCell>
                              <View style={{ flex: 2, flexDirection: "row" }}>
                                <CompactCell>{d.value}</CompactCell>
                                {d.icon && (
                                  <CompactCell style={{ flex: undefined }}>
                                    <IconButton icon={d.icon} onPress={device.SM ? d.onPress : undefined} />
                                  </CompactCell>
                                )}
                              </View>
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
              user={user}
              buyRoutes={buyRoutes}
              setBuyRoutes={setBuyRoutes}
              sellRoutes={sellRoutes}
              setSellRoutes={setSellRoutes}
              stakingRoutes={stakingRoutes}
              setStakingRoutes={setStakingRoutes}
              isBuyRouteEdit={isBuyRouteEdit}
              setIsBuyRouteEdit={setIsBuyRouteEdit}
              isSellRouteEdit={isSellRouteEdit && !isUserEdit}
              setIsSellRouteEdit={sellRouteEdit}
              isStakingRouteEdit={isStakingRouteEdit}
              setIsStakingRouteEdit={stakingRouteEdit}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};



export default withSettings(withSession(HomeScreen));
