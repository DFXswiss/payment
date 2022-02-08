import React, { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Portal, Dialog, Paragraph } from "react-native-paper";
import { SpacerV } from "../elements/Spacers";
import AppStyles from "../styles/AppStyles";
import Loading from "./util/Loading";

const KycInit = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={AppStyles.dialog} dismissable={false}>
        <Dialog.Content>
          <Paragraph>{t("model.kyc.initiating")}</Paragraph>
          <SpacerV />
          <Loading size="large" />
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

export default KycInit;
