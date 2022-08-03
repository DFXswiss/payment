import React, { useState } from "react";
import { Linking, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { DataTable } from "react-native-paper";
import { CompactCell, CompactHeader, CompactRow, CompactTitle } from "../elements/Tables";
import Moment from "moment";
import { formatAmount } from "../utils/Utils";
import { useDevice } from "../hooks/useDevice";
import IconButton from "./util/IconButton";
import DeFiModal from "./util/DeFiModal";
import { RouteHistoryAlias, RouteHistoryType } from "../models/RouteHistory";

enum DirectionType {
  INPUT,
  OUTPUT,
}

interface Props {
  history: RouteHistoryAlias[];
}

const RouteHistory = ({ history }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const [showsDetail, setShowsDetail] = useState(false);
  const [transaction, setTransaction] = useState<RouteHistoryAlias>();

  const invalidValue = "-";

  const isInvalid = (value: any): boolean => {
    return value === undefined || value === null;
  };

  const dateFormat = (): string => {
    return device.SM ? "L HH:mm" : "L";
  };

  const needsFormat = (tx: RouteHistoryAlias, direction: DirectionType): boolean => {
    return (
      (tx.type === RouteHistoryType.BUY && direction === DirectionType.INPUT) ||
      (tx.type === RouteHistoryType.SELL && direction === DirectionType.OUTPUT)
    );
  };

  const formatAmountAndAsset = (
    amount: number,
    asset: string,
    tx: RouteHistoryAlias,
    direction: DirectionType
  ): string => {
    return needsFormat(tx, direction) ? `${formatAmount(amount)} ${asset}` : `${amount} ${asset}`;
  };

  const dateOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.date)) return invalidValue;
    return Moment(tx.date).format(dateFormat());
  };

  const inputOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.inputAmount) || isInvalid(tx.inputAsset)) return invalidValue;
    return formatAmountAndAsset(tx.inputAmount, tx.inputAsset, tx, DirectionType.INPUT);
  };

  const outputOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.outputAmount) || isInvalid(tx.outputAsset)) return invalidValue;
    return formatAmountAndAsset(tx.outputAmount, tx.outputAsset, tx, DirectionType.OUTPUT);
  };

  const amlCheckOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.amlCheck)) return invalidValue;
    return t(`model.route.aml_check_${tx.amlCheck.toLowerCase()}`);
  };

  const statusOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.isComplete)) return invalidValue;
    return tx.isComplete ? t("model.route.status_complete") : t("model.route.status_incomplete");
  };

  const showDetail = (tx: RouteHistoryAlias) => {
    setTransaction(tx);
    setShowsDetail(true);
  };

  const defiscanTxLink = (tx: RouteHistoryAlias): string => {
    return `https://defiscan.live/transactions/${tx.txId}`;
  };

  const openLink = async (tx: RouteHistoryAlias) => {
    const link = defiscanTxLink(tx);
    if (await Linking.canOpenURL(link)) await Linking.openURL(link);
  };

  const data = (tx: RouteHistoryAlias) => [
    { condition: true, label: "model.route.date", value: dateOf(tx) },
    { condition: true, label: "model.route.input", value: inputOf(tx) },
    { condition: true, label: "model.route.output", value: outputOf(tx) },
    { condition: true, label: "model.route.aml_check", value: amlCheckOf(tx) },
    { condition: true, label: "model.route.status", value: statusOf(tx) },
    {
      condition: true,
      label: "model.route.tx_link",
      icon: "chevron-right",
      onPress: () => openLink(tx),
    },
  ];

  return (
    <>
      <DeFiModal isVisible={showsDetail} setIsVisible={() => setShowsDetail(false)} title={t("model.route.tx_details")}>
        {transaction && (
          <DataTable>
            {data(transaction)
              .filter((d) => d.condition)
              .map((d) => (
                <CompactRow key={d.label}>
                  <CompactCell style={styles.default}>{t(d.label)}</CompactCell>
                  {d.value && <CompactCell style={styles.right}>{d.value}</CompactCell>}
                  {d.icon && d.onPress && (
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton icon={d.icon} onPress={d.onPress} />
                    </CompactCell>
                  )}
                </CompactRow>
              ))}
          </DataTable>
        )}
      </DeFiModal>

      <DataTable>
        <CompactHeader>
          <CompactTitle style={styles.default}>{t("model.route.date")}</CompactTitle>
          {device.MD && (
            <>
              <CompactTitle style={styles.right}>{t("model.route.input")}</CompactTitle>
              <CompactTitle style={styles.right}>{t("model.route.output")}</CompactTitle>
            </>
          )}
          <CompactTitle style={styles.right}>{t("model.route.aml_check")}</CompactTitle>
          <CompactTitle style={styles.right}>{t("model.route.status")}</CompactTitle>
          <CompactTitle style={styles.icon}>{device.MD ? t("model.route.link") : ""}</CompactTitle>
        </CompactHeader>
        {history.map((entry, i) => (
          <CompactRow style={styles.row} key={i}>
            <CompactCell style={styles.default}>{dateOf(entry)}</CompactCell>
            {device.MD && (
              <>
                <CompactCell style={styles.right}>{inputOf(entry)}</CompactCell>
                <CompactCell style={styles.right}>{outputOf(entry)}</CompactCell>
              </>
            )}
            <CompactCell style={styles.right}>{amlCheckOf(entry)}</CompactCell>
            <CompactCell style={styles.right}>{statusOf(entry)}</CompactCell>
            <CompactCell style={styles.icon}>
              <IconButton
                icon="chevron-right"
                onPress={() => {
                  device.MD ? openLink(entry) : showDetail(entry);
                }}
              />
            </CompactCell>
          </CompactRow>
        ))}
      </DataTable>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    height: 48,
  },
  default: {
    flex: 2,
  },
  right: {
    flex: 2,
    justifyContent: "flex-end",
  },
  icon: {
    flex: 1,
    justifyContent: "flex-end",
  },
});

export default RouteHistory;
