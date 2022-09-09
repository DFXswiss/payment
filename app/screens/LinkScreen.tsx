import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import ButtonContainer from "../components/util/ButtonContainer";
import { DeFiButton } from "../elements/Buttons";
import { DataTable, Dialog, Paragraph, Portal, Text } from "react-native-paper";
import { getLinkAddress, postLinkAddress } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import Routes from "../config/Routes";
import { LinkAddressDto } from "../models/Link";
import { CompactCell, CompactRow } from "../elements/Tables";
import { useDevice } from "../hooks/useDevice";
import Loading from "../components/util/Loading";
import Moment from "moment";

const LinkScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const device = useDevice();

  const [isLoading, setIsLoading] = useState(true);
  const [linkAddress, setLinkAddress] = useState<LinkAddressDto>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showsSuccess, setShowsSuccess] = useState(false);
  const [showsExpiration, setShowsExpiration] = useState(false);

  useEffect(() => {
    // get params
    const params = route.params as any;

    nav.navigate(Routes.Link, { authentication: undefined });

    if (params && params.authentication) {
      getLinkAddress(params.authentication)
        .then(setLinkAddress)
        .catch(() => onLoadFailed())
        .finally(() => setIsLoading(false));
    } else {
      onLoadFailed();
    }
  }, []);

  const onSubmit = () => {
    setIsProcessing(true);

    if (!linkAddress) return;

    if (new Date(linkAddress.expiration) < new Date()) {
      setShowsExpiration(true);
      setIsProcessing(false);
      return;
    }

    postLinkAddress(linkAddress.authentication)
      .then(() => setShowsSuccess(true))
      .catch(() => onLoadFailed())
      .finally(() => setIsProcessing(false));
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.Home);
  };

  const goToHome = () => {
    setShowsSuccess(false);
    nav.navigate(Routes.Home);
  };

  const linkAddressData = (dto?: LinkAddressDto) => [
    { condition: true, label: "model.link.existing_address", value: dto?.existingAddress },
    { condition: true, label: "model.link.new_address", value: dto?.newAddress },
    {
      condition: true,
      label: "model.link.is_completed",
      value: dto?.isCompleted ? t("model.link.complete") : t("model.link.incomplete"),
    },
    { condition: true, label: "model.link.expiration", value: Moment(dto?.expiration).format("L HH:mm") },
  ];

  return (
    <AppLayout>
      {isLoading && <Loading size="large" />}

      {!isLoading && linkAddress && (
        <>
          <Portal>
            <Dialog visible={showsSuccess} onDismiss={() => setShowsSuccess(false)} style={AppStyles.dialog}>
              <Dialog.Content>
                <Paragraph>{t("link.success")}</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <DeFiButton onPress={() => goToHome()}>{t("action.ok")}</DeFiButton>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <Portal>
            <Dialog visible={showsExpiration} onDismiss={() => setShowsExpiration(false)} style={AppStyles.dialog}>
              <Dialog.Content>
                <Paragraph>{t("link.expired")}</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <DeFiButton onPress={() => goToHome()}>{t("action.ok")}</DeFiButton>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <View>
            <H2 text={t("link.header")} />
          </View>
          <SpacerV />
          <DataTable>
            {linkAddressData(linkAddress).map(
              (d) =>
                d.condition && (
                  <CompactRow key={d.label}>
                    <CompactCell multiLine>{t(d.label)}</CompactCell>
                    <View style={{ flex: device.SM ? 2 : 1, flexDirection: "row" }}>
                      <CompactCell multiLine>
                        <Text>{d.value}</Text>
                      </CompactCell>
                    </View>
                  </CompactRow>
                )
            )}
          </DataTable>
          <SpacerV />
          <ButtonContainer>
            <DeFiButton disabled={linkAddress?.isCompleted} mode="contained" loading={isProcessing} onPress={onSubmit}>
              {t("action.link")}
            </DeFiButton>
          </ButtonContainer>
        </>
      )}
    </AppLayout>
  );
};

export default LinkScreen;
