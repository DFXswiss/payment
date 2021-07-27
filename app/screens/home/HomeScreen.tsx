import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import { SpacerV } from "../../elements/Spacers";
import { H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { User } from "../../models/User";
import { getBuyRoutes, getSellRoutes, getUser } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import AppLayout from "../../components/AppLayout";
import useGuard from "../../hooks/useGuard";
import NotificationService from "../../services/NotificationService";
import { DataTable, FAB, Portal } from "react-native-paper";
import { CompactCell, CompactRow } from "../../elements/Tables";
import { useDevice } from "../../hooks/useDevice";
import { DeFiButton } from "../../elements/Buttons";
import useLoader from "../../hooks/useLoader";
import { BuyRoute } from "../../models/BuyRoute";
import { SellRoute } from "../../models/SellRoute";
import { join } from "../../utils/Utils";
import useAuthGuard from "../../hooks/useAuthGuard";

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
  { condition: Boolean(user.ref), label: "model.user.own_ref", value: user.ref },
];

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const device = useDevice();

  // TODO: full KYC Access
  // Button Limit erhöhen bei aktuellem KYC status display => Benutzerdaten => KYC Process starten

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [buyRoutes, setBuyRoutes] = useState<BuyRoute[]>();
  const [sellRoutes, setSellRoutes] = useState<SellRoute[]>();
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isBuyRouteEdit, setIsBuyRouteEdit] = useState(false);
  const [isSellRouteEdit, setIsSellRouteEdit] = useState(false);

  const onUserChanged = (newUser: User) => {
    setUser(newUser);
    setIsUserEdit(false);
  };

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

  useAuthGuard(session);

  return (
    <AppLayout>
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? "close" : "pencil"}
          actions={[
            { icon: "account-edit", label: t("model.user.data"), onPress: () => setIsUserEdit(true) },
            { icon: "plus", label: t("model.route.buy"), onPress: () => setIsBuyRouteEdit(true) },
            { icon: "plus", label: t("model.route.sell"), onPress: () => setIsSellRouteEdit(true) },
          ]}
          onStateChange={({ open }: { open: boolean }) => setFabOpen(open)}
          visible={showButtons}
        />
      </Portal>

      <DeFiModal isVisible={isUserEdit} setIsVisible={setIsUserEdit} title={t("model.user.edit")}>
        <UserEdit isVisible={isUserEdit} user={user} onUserChanged={onUserChanged} />
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
                  <View style={AppStyles.mla}>
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
              user={user}
              buyRoutes={buyRoutes}
              setBuyRoutes={setBuyRoutes}
              sellRoutes={sellRoutes}
              setSellRoutes={setSellRoutes}
              isBuyRouteEdit={isBuyRouteEdit}
              setIsBuyRouteEdit={setIsBuyRouteEdit}
              isSellRouteEdit={isSellRouteEdit}
              setIsSellRouteEdit={setIsSellRouteEdit}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default withSession(HomeScreen);
