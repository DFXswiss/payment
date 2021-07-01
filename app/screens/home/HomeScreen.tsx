import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { StyleSheet, View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import UserEdit from "../../components/edit/UserEdit";
import Colors from "../../config/Colors";
import { SpacerV } from "../../elements/Spacers";
import { H1, H2 } from "../../elements/Texts";
import withSession from "../../hocs/withSession";
import { User } from "../../models/User";
import { getActiveRoutes, getUser } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import { Session } from "../../services/AuthService";
import RouteList from "./RouteList";
import { PaymentRoutes } from "../../models/PaymentRoutes";
import AppLayout from "../../components/AppLayout";
import useGuard from "../../hooks/useGuard";
import NotificationService from "../../services/NotificationService";
import { DataTable, FAB, Portal } from "react-native-paper";
import Device from "../../utils/Device";
import { CompactCell, CompactRow } from "../../elements/Tables";
import { useIsFocused } from "@react-navigation/native";

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();

  // TODO: full KYC Access
  // Button Limit erhöhen bei aktuellem KYC status display => Benutzerdaten => KYC Process starten

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [routes, setRoutes] = useState<PaymentRoutes>();
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
    setRoutes(undefined);
    setIsUserEdit(false);
  };

  const userData = (user: User) => [
    { condition: user.address, label: "model.user.address", value: user.address },
    { condition: user.firstName || user.lastName, label: "model.user.name", value: `${user.firstName} ${user.lastName}` },
    { condition: user.street || user.houseNumber, label: "model.user.home", value: `${user.street} ${user.houseNumber}` },
    { condition: user.zip, label: "model.user.zip", value: user.zip },
    { condition: user.location, label: "model.user.location", value: user.location },
    { condition: user.country, label: "model.user.country", value: user.country.name },
    { condition: user.mail, label: "model.user.mail", value: user.mail },
    { condition: user.mobileNumber, label: "model.user.mobile_number", value: user.mobileNumber },
    { condition: user.usedRef, label: "model.user.used_ref", value: user.usedRef },
    // TODO: KYC status, gebühr
    { condition: user.ref, label: "model.user.ref", value: user.ref },
  ];

  useEffect(() => {
    if (session) {
      if (session.isLoggedIn) {
        Promise.all([getUser().then((user) => setUser(user)), getActiveRoutes().then(setRoutes)])
          .catch(() => NotificationService.show(t("feedback.load_failed")))
          .finally(() => setLoading(false));
      } else {
        reset();
      }
    }
  }, [session]);
  // TODO: use cancelling if moved away?

  useGuard(() => session && !session.isLoggedIn, [session]);

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
          visible={useIsFocused() && !isLoading && !Device.SM}
        />
      </Portal>

      <DeFiModal isVisible={isUserEdit} setIsVisible={setIsUserEdit} title={t("model.user.edit")}>
        <UserEdit isVisible={isUserEdit} user={user} onUserChanged={onUserChanged} />
      </DeFiModal>

      <View style={AppStyles.container}>
        <H1 text={t("general.welcome")} style={AppStyles.center} />

        <SpacerV height={50} />

        {isLoading && <Loading size="large" />}

        {!isLoading && (
          <>
            {user && (
              <View>
                <View style={AppStyles.containerHorizontal}>
                  <H2 text={t("model.user.your_data")} />
                  {Device.SM && (
                    <View style={AppStyles.mla}>
                      <Button color={Colors.Primary} title={t("action.edit")} onPress={() => setIsUserEdit(true)} />
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
                          <CompactCell style={styles.dataCell}>{d.value}</CompactCell>
                        </CompactRow>
                      )
                  )}
                </DataTable>
              </View>
            )}

            <SpacerV height={50} />

            {routes && (
              <RouteList
                user={user}
                routes={routes}
                setRoutes={setRoutes}
                isBuyRouteEdit={isBuyRouteEdit}
                setIsBuyRouteEdit={setIsBuyRouteEdit}
                isSellRouteEdit={isSellRouteEdit}
                setIsSellRouteEdit={setIsSellRouteEdit}
              />
            )}
          </>
        )}
      </View>
    </AppLayout>

    // TODO: remove change logo PNG
    // <View style={[AppStyles.container, styles.container]}>
    //   <Image
    //     style={styles.image}
    //     source={require("../assets/change_logo.png")}
    //   />
    //   <Text style={styles.text}>
    //     <Text style={{ color: colors.Primary }}>DEFI</Text>CHANGE
    //   </Text>
    //   <Text>{t('coming_soon')}</Text>
    // </View>
  );
};

const styles = StyleSheet.create({
  dataCell: {
    flex: Device.SM ? 2 : 1,
  },
});

export default withSession(HomeScreen);
