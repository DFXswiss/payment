import React, { useState, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { KycStatus, User, UserStatus } from "../../models/User";
import { getBuyRoutes, getSellRoutes, getUser, postKyc } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import { Button, DataTable, Dialog, FAB, Paragraph, Portal } from "react-native-paper";
import { CompactCell, CompactRow } from "../../elements/Tables";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import useLoader from "../../hooks/useLoader";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { join, resolve } from "../../utils/Utils";
import useAuthGuard from "../../hooks/useAuthGuard";
import Colors from "../../config/Colors";

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const device = useDevice();

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
    if (!userDataComplete()) {
      setIsUserEdit(true);
    }
    setIsKycRequest(true);
  };

  const requestKyc = (): void => {
    setIsKycLoading(true);
    postKyc()
      .then(() => {
        if (user){
          user.kycStatus = KycStatus.WAIT_CHAT_BOT;
        }
        NotificationService.show(t('feedback.request_submitted'));
      })
      .catch(() => NotificationService.show(t('feedback.request_failed')))
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
          Promise.all([getUser(), getBuyRoutes(), getSellRoutes()])
            .then(([user, buyRoutes, sellRoutes]) => {
              if (!cancelled()) {
                setUser(user);
                setBuyRoutes(buyRoutes);
                setSellRoutes(sellRoutes);
              }
            })
            .catch(() => NotificationService.show(t("feedback.load_failed")))
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
    { icon: "account-check", label: t("model.user.kyc"), onPress: onKyc, visible: user?.status != UserStatus.NA && user?.kycStatus == KycStatus.NA },
    { icon: "plus", label: t("model.route.buy"), onPress: () => setIsBuyRouteEdit(true), visible: true },
    { icon: "plus", label: t("model.route.sell"), onPress: () => sellRouteEdit(true), visible: false }, // TODO: reactivate
  ];

  useAuthGuard(session);



  const limit = (user: User): string => {
    const limit = user.kycStatus === KycStatus.NA || user.kycStatus === KycStatus.WAIT_CHAT_BOT ? 900 : 100000;
    return `${limit} € ${t("model.user.per_day")}`;
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
    { condition: Boolean(user.refData.refVolume), label: "model.user.ref_volume", value: `${user.refData.refVolume} €` },
    { condition: Boolean(user.userVolume.buyVolume), label: "model.user.user_buy_volume", value: `${user.userVolume.buyVolume} €` },
    { condition: Boolean(user.userVolume.sellVolume), label: "model.user.user_sell_volume", value: `${user.userVolume.sellVolume} €` },
    { condition: user.kycStatus != KycStatus.NA, label: "model.user.kyc_status", value: user.kycStatus },
    { condition: true,label: "model.user.buy_limit", value: limit(user)},
  ];

  return (
    <AppLayout>
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? "close" : "pencil"}
          actions={fabButtons.filter(b => b.visible)}
          onStateChange={({ open }: { open: boolean }) => setFabOpen(open)}
          visible={showButtons}
        />

        <Dialog visible={isKycRequest && !isUserEdit} onDismiss={() => setIsKycRequest(false)} style={styles.dialog}>
          <Dialog.Content>
            <Paragraph>{t("model.user.kyc_request")}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsKycRequest(false)} color={Colors.Grey}>{t("action.abort")}</Button>
            <DeFiButton onPress={requestKyc} loading={isKycLoading}>{t("action.send")}</DeFiButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <DeFiModal isVisible={isUserEdit} setIsVisible={userEdit} title={t("model.user.edit")}>
        <UserEdit user={user} onUserChanged={onUserChanged} allDataRequired={isSellRouteEdit || isKycRequest} />
      </DeFiModal>

      <SpacerV height={50} />

      {isLoading && <Loading size="large" />}

      {!isLoading && (
        <>
          {user && (
            <View>
              <View style={AppStyles.containerHorizontal}>
                <H2 text={t("model.user.your_data")} />
                {device.SM && (
                  <View style={[AppStyles.mla, AppStyles.containerHorizontal]}>
                    {(user?.status != UserStatus.NA && user?.kycStatus == KycStatus.NA) && (
                      <View style={AppStyles.mr10}>
                        <DeFiButton mode="contained" onPress={onKyc}>
                          {t("model.user.kyc")}
                        </DeFiButton>
                      </View>
                    )}
                    <DeFiButton mode="contained" onPress={() => setIsUserEdit(true)}>
                      {t("action.edit")}
                    </DeFiButton>
                  </View>
                )}
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

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 300,
    marginHorizontal: 'auto',
  },
});

export default withSession(HomeScreen);
