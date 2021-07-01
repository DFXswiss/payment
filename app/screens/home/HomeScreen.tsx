import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { View } from "react-native";
import DeFiModal from "../../components/util/DeFiModal";
import Loading from "../../components/util/Loading";
import Row from "../../components/util/Row";
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

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();

  // TODO: full KYC Access
  // Button Limit erhöhen bei aktuellem KYC status display => Benutzerdaten => KYC Process starten

  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [routes, setRoutes] = useState<PaymentRoutes>();
  const [isUserEdit, setIsUserEdit] = useState(false);

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
                  <View style={AppStyles.mla}>
                    <Button color={Colors.Primary} title={t("action.edit")} onPress={() => setIsUserEdit(true)} />
                  </View>
                </View>
                {user.address ? <Row cells={[t("model.user.address"), user.address]} /> : null}
                {user.firstName || user.lastName ? (<Row cells={[t("model.user.name"), `${user.firstName} ${user.lastName}`]} />) : null}
                {user.street || user.houseNumber ? (<Row cells={[t("model.user.home"), `${user.street} ${user.houseNumber}`]} />) : null}
                {user.zip ? <Row cells={[t("model.user.zip"), user.zip]} /> : null}
                {user.location ? <Row cells={[t("model.user.location"), user.location]} /> : null}
                {user.country ? <Row cells={[t("model.user.country"), user.country.name]} /> : null}
                {user.mail ? <Row cells={[t("model.user.mail"), user.mail]} /> : null}
                {user.mobileNumber ? <Row cells={[t("model.user.mobile_number"), user.mobileNumber]} /> : null}
                {user.usedRef ? <Row cells={[t("model.user.used_ref"), user.usedRef]} /> : null}
                {/* TODO: KYC status, gebühr */}

                <SpacerV />
                {user.ref ? <Row cells={[t("model.user.ref"), user.ref]} /> : null}
              </View>
            )}

            <SpacerV height={50} />

            {routes && <RouteList routes={routes} setRoutes={setRoutes} user={user} />}
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

export default withSession(HomeScreen);
