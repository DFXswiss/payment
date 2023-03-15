import React, { useState, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { View, Image } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import {
  getKycStatusString,
  getTradeLimit,
  kycCompleted,
  KycInfo,
  kycInProgress,
  KycState,
  KycStatus,
  UserDetail,
  UserStatus,
} from "../../models/User";
import { getRoutes, getStatistic, getUserDetail } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import { DataTable, Text } from "react-native-paper";
import { CompactCell, CompactRow } from "../../elements/Tables";
import { useDevice } from "../../hooks/useDevice";
import useLoader from "../../hooks/useLoader";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { formatAmount, openUrl, resolve } from "../../utils/Utils";
import useAuthGuard from "../../hooks/useAuthGuard";
import Colors from "../../config/Colors";
import { Environment } from "../../env/Environment";
import ClipboardService from "../../services/ClipboardService";
import { ApiError } from "../../models/ApiDto";
import IconButton from "../../components/util/IconButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { navigate } from "../../utils/NavigationHelper";
import Routes from "../../config/Routes";
import { StakingRoute } from "../../models/StakingRoute";
import withSettings from "../../hocs/withSettings";
import { AppSettings } from "../../services/SettingsService";
import { CryptoRoute } from "../../models/CryptoRoute";
import KycDataEdit from "../../components/edit/KycDataEdit";
import { KycData } from "../../models/KycData";
import ChangeUser from "../../components/ChangeUser";
import { Statistic } from "../../models/Statistic";

const HomeScreen = ({ session, settings }: { session?: Session; settings?: AppSettings }) => {
  const { t } = useTranslation();
  const device = useDevice();
  const RefUrl = Environment.api.refUrl;
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail>();
  const [buyRoutes, setBuyRoutes] = useState<BuyRoute[]>();
  const [sellRoutes, setSellRoutes] = useState<SellRoute[]>();
  const [stakingRoutes, setStakingRoutes] = useState<StakingRoute[]>();
  const [cryptoRoutes, setCryptoRoutes] = useState<CryptoRoute[]>();
  const [statistic, setStatistic] = useState<Statistic>();
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);
  const [isStakingRouteEdit, setIsStakingRouteEdit] = useState(false);
  const [isCryptoRouteEdit, setIsCryptoRouteEdit] = useState(false);
  const [isChangeUserAvailable, setIsChangeUserAvailable] = useState(false);
  const [isChangeUser, setIsChangeUser] = useState(false);

  const sellRouteEdit = (update: SetStateAction<boolean>) => {
    if (resolve(update, isSellRouteEdit) && !user?.kycDataComplete) {
      setIsUserEdit(true);
    }

    setIsSellRouteEdit(update);
  };

  const areKycChecksSuccessful = (): boolean => {
    if (user?.kycStatus === KycStatus.NA) {
      onIncreaseLimit();
      return false;
    } else if (
      kycInProgress(user?.kycStatus) ||
      user?.kycStatus === KycStatus.CHECK ||
      user?.kycStatus === KycStatus.REJECTED
    ) {
      NotificationService.error(t("model.kyc.kyc_not_complete"));
      return false;
    }
    return true;
  };

  const stakingRouteEdit = (update: SetStateAction<boolean>) => {
    if (resolve(update, isStakingRouteEdit)) {
      // bank TX required
      if (user?.status !== UserStatus.ACTIVE) return NotificationService.error(t("feedback.bank_tx_required"));

      // check if user has KYC
      if (!areKycChecksSuccessful()) {
        return;
      }
    } else {
      // reload all routes after close (may impact sell routes)
      loadRoutes();
    }

    setIsStakingRouteEdit(update);
  };

  const cryptoRouteEdit = (update: SetStateAction<boolean>) => {
    if (resolve(update, isCryptoRouteEdit)) {
      // check if user has KYC
      if (!areKycChecksSuccessful()) {
        return;
      }
    }

    setIsCryptoRouteEdit(update);
  };

  const userEdit = (edit: boolean) => {
    setIsUserEdit(edit);
    if (!edit) {
      setIsSellRouteEdit(false);
    }
  };

  const onUserChanged = (newUser: UserDetail) => {
    setUser(newUser);
    setIsUserEdit(false);
  };

  const onKycDataChanged = (newKycData: KycData, info: KycInfo) => {
    setUser(
      (currentUser) =>
        currentUser && {
          ...currentUser,
          ...newKycData,
          ...info,
        }
    );
    setIsUserEdit(false);
  };

  const onIncreaseLimit = () => {
    // start KYC
    goToKycScreen();
  };

  const goToKycScreen = (code: string | undefined = user?.kycHash) =>
    navigate(Routes.Kyc, {
      code: code ?? "",
      autostart: "1",
      phone: user?.phone ?? "",
      mail: user?.mail ?? "",
      redirect_uri: window.location.origin,
    });

  const reset = (): void => {
    setLoading(true);
    setUser(undefined);
    setBuyRoutes(undefined);
    setSellRoutes(undefined);
    setStakingRoutes(undefined);
    setCryptoRoutes(undefined);
    setIsUserEdit(false);
  };

  const loadRoutes = (): Promise<void> => {
    return getRoutes().then((routes) => {
      setBuyRoutes(routes.buy);
      setSellRoutes(routes.sell);
      setStakingRoutes(routes.staking);
      setCryptoRoutes(routes.crypto);
    });
  };

  useLoader(
    (cancelled) => {
      if (session) {
        if (session.isLoggedIn) {
          Promise.all([getUserDetail(), loadRoutes(), getStatistic()])
            .then(([user, _, statistic]) => {
              if (!cancelled()) {
                setUser(user);
                setIsChangeUserAvailable(user?.linkedAddresses != undefined && user.linkedAddresses.length > 1);
                setStatistic(statistic);
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

  const userData = (user: UserDetail) => [
    {
      condition: Boolean(user.address),
      label: "model.user.address",
      value: user.address,
      icon: isChangeUserAvailable ? "swap-horizontal" : undefined,
      onPress: () => setIsChangeUser(true),
    },
    { condition: true, label: "model.user.mail", value: user.mail, emptyHint: t("model.user.add_mail") },
    { condition: Boolean(user.phone), label: "model.user.mobile_number", value: user.phone },
    {
      condition: user.kycStatus != KycStatus.NA,
      label: "model.kyc.status",
      value: getKycStatusString(user),
      icon: kycInProgress(user.kycStatus) && user.kycState !== KycState.REVIEW ? "reload" : undefined,
      onPress: () => goToKycScreen(),
    },
    {
      condition: true,
      label: "model.user.limit",
      value: getTradeLimit(user),
      icon: user.kycStatus === KycStatus.NA || kycCompleted(user.kycStatus) ? "arrow-up" : undefined,
      onPress: onIncreaseLimit,
    },
  ];

  const refLink = (user: UserDetail): string => {
    return `${RefUrl}${user.ref}`;
  };

  const refData = (user: UserDetail) => [
    {
      condition: Boolean(user.ref),
      label: "model.user.ref_link",
      value: user.ref,
      icon: "content-copy",
      onPress: () => ClipboardService.copy(refLink(user)),
    },
    {
      condition: Boolean(user.ref),
      label: "model.user.ref_commission",
      value: `${user.refFeePercent}%`,
    },
    { condition: Boolean(user.refCount), label: "model.user.ref_count", value: user.refCount },
    {
      condition: Boolean(user.refCountActive),
      label: "model.user.ref_count_active",
      value: user.refCountActive,
    },
    {
      condition: Boolean(user.refVolume),
      label: "model.user.ref_volume",
      value: `${formatAmount(user.refVolume)} €`,
    },
    {
      condition: Boolean(user.refCredit),
      label: "model.user.ref_bonus",
      value: `${formatAmount(user.paidRefCredit)} €`,
    },
  ];

  return (
    <AppLayout>
      <DeFiModal
        isVisible={isUserEdit}
        setIsVisible={userEdit}
        title={t(isSellRouteEdit && !user?.kycDataComplete ? "model.user.edit" : "model.user.settings")}
        style={{ width: 500 }}
      >
        {isSellRouteEdit && !user?.kycDataComplete ? (
          // kycHash is auto-generated and therefore should never be null
          <KycDataEdit code={user?.kycHash ?? ""} user={user} onChanged={onKycDataChanged} />
        ) : (
          <UserEdit user={user} onUserChanged={onUserChanged} />
        )}
      </DeFiModal>

      {isChangeUserAvailable && (
        <DeFiModal
          isVisible={isChangeUser}
          setIsVisible={setIsChangeUser}
          title={t("model.user.change")}
          style={{ width: 500 }}
        >
          <ChangeUser user={user} onChanged={() => setIsChangeUser(false)} />
        </DeFiModal>
      )}

      {!settings?.headless && <SpacerV height={30} />}

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          {user && (
            <View>
              <View style={[AppStyles.containerHorizontal]}>
                <H2 text={t("model.user.your_data")} />
                <IconButton icon="cog" style={AppStyles.mla} size={30} onPress={() => setIsUserEdit(true)} />
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

              {user.bsLink && (
                <>
                  <SpacerV height={50} />
                  <H2 text={t("model.user.vip_title")} />
                  <SpacerV />
                  <DataTable>
                          <TouchableOpacity onPress={ () => openUrl(user.bsLink)} key={'model.user.vip_description'} disabled={!'open-in-new'  || device.SM}>
                            <CompactRow>
                              <CompactCell multiLine style={{ flex: 3 }}>
                                {t('model.user.vip_description')}
                              </CompactCell>
                            </CompactRow>
                            <CompactRow>
                            <CompactCell multiLine style={{ flex: 3 }}>
                                {t('model.user.vip_link')}
                              </CompactCell>
                            <View style={{ flex: 2, flexDirection: "row" }}>
                                {(
                                  <CompactCell style={{ flex: undefined }}>
                                    <IconButton icon={'open-in-new'} onPress={device.SM ? () => openUrl(user.bsLink) : undefined} />
                                  </CompactCell>
                                )}
                              </View>
                              </CompactRow>
                          </TouchableOpacity>
                  </DataTable>
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
              setUser={setUser}
              statistic={statistic}
              buyRoutes={buyRoutes}
              setBuyRoutes={setBuyRoutes}
              sellRoutes={sellRoutes}
              setSellRoutes={setSellRoutes}
              stakingRoutes={stakingRoutes}
              setStakingRoutes={setStakingRoutes}
              cryptoRoutes={cryptoRoutes}
              setCryptoRoutes={setCryptoRoutes}
              isBuyRouteEdit={isBuyRouteEdit}
              setIsBuyRouteEdit={setIsBuyRouteEdit}
              isSellRouteEdit={isSellRouteEdit && !isUserEdit}
              setIsSellRouteEdit={sellRouteEdit}
              isStakingRouteEdit={isStakingRouteEdit}
              setIsStakingRouteEdit={stakingRouteEdit}
              isCryptoRouteEdit={isCryptoRouteEdit}
              setIsCryptoRouteEdit={cryptoRouteEdit}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default withSettings(withSession(HomeScreen));
