import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import withSession from "../../hocs/withSession";
import { KycStatus, User } from "../../models/User";
import { getUserDetail } from "../../services/ApiService";
import { Session } from "../../services/AuthService";
import AppLayout from "../../components/AppLayout";
import NotificationService from "../../services/NotificationService";
import useLoader from "../../hooks/useLoader";
import useAuthGuard from "../../hooks/useAuthGuard";
import { Environment } from "../../env/Environment";
import Clipboard from "expo-clipboard";
import { ApiError } from "../../models/ApiDto";
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "react-native";
import Loading from "@components/util/Loading";
import { Button } from "@components/Button";
import { OnboardingCarousel } from "@components/OnboardingCarousel";

const formatAmount = (amount?: number): string => amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? "";

const HomeScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();

  const reset = (): void => {
    setLoading(true);
    setUser(undefined);
  };

  useLoader(
    (cancelled) => {
      if (session) {
        if (session.isLoggedIn) {
          getUserDetail()
            .then((user) => {
              if (!cancelled()) {
                setUser(user);
              }
            })
            .catch((e: ApiError) =>
              e.statusCode != 401 ? NotificationService.error(t("feedback.load_failed")) : undefined
            ) // auto logout
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

  return (
    <AppLayout>
      <ThemedScrollView>
        <View style={tailwind('mb-4')}>
          <OnboardingCarousel />
        </View>
        {isLoading && <Loading size="large" />}
        {!isLoading && user && (
          <>
            <ClickableRow
              label={t("model.user.buy_limit")}
              value={limit(user)}
              icon="chevron-right"
              onPress={() => {}}
            />
            <ClickableRow
              label={t("model.user.own_ref")}
              value={user.refData.ref}
              icon="content-copy"
              onPress={() => {
                Clipboard.setString(`${Environment.api.refUrl}${user.refData.ref}`);
                NotificationService.success("TODO.feedback.copied");
              }}
            />

            <View style={tailwind("mt-5 items-center")}>
              {/* TODO: large screen */}
              <Button label={t("TODO icon buy")} margin="m-0 mb-3" onPress={() => {}} />
              <Button label={t("TODO icon sell")} margin="m-0" onPress={() => {}} />
            </View>
          </>
        )}
      </ThemedScrollView>
    </AppLayout>
  );
};

function ClickableRow({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: string;
  onPress: () => void;
}): JSX.Element {
  return (
    <ThemedTouchableOpacity
      dark={tailwind("bg-dfxblue-800 border-b border-dfxblue-900")}
      light={tailwind("bg-white border-b border-gray-100")}
      onPress={onPress}
      style={tailwind("py-4 pl-4 pr-2 flex-row justify-between items-center")}
    >
      <View style={tailwind('flex-1')}>
        <ThemedText ellipsizeMode='tail'>{label}</ThemedText>
      </View>
      <View style={tailwind("flex-1 flex-row justify-end items-center")}>
        <ThemedText light={tailwind("text-dfxgray-500")} dark={tailwind("text-dfxgray-400")}>
          {value}
        </ThemedText>
        <ThemedIcon style={tailwind("ml-2")} iconType="MaterialIcons" name={icon} size={20} />
      </View>
    </ThemedTouchableOpacity>
  );
}

export default withSession(HomeScreen);
