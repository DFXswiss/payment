import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { DataTable } from "react-native-paper";
import { CompactCell, CompactHeader, CompactRow, CompactTitle } from "../elements/Tables";
import Moment from "moment";
import { formatAmount, formatAmountCrypto, openUrl, round } from "../utils/Utils";
import { useDevice } from "../hooks/useDevice";
import IconButton from "./util/IconButton";
import DeFiModal from "./util/DeFiModal";
import { AmlCheck, RouteHistoryAlias, RouteHistoryType } from "../models/RouteHistory";
import { TouchableOpacity } from "react-native-gesture-handler";
import BigNumber from "bignumber.js";

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
  const iconOpenLink = "export";
  const iconShowDetail = "chevron-right";

  const isInvalid = (value: any): boolean => {
    return value == null;
  };

  const dateFormat = (): string => {
    return device.SM ? "L HH:mm" : "L";
  };

  const isFiatInput = (tx: RouteHistoryAlias, direction: DirectionType): boolean => {
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
    return isFiatInput(tx, direction) ? `${formatAmount(amount)} ${asset}` : `${formatAmountCrypto(amount)} ${asset}`;
  };

  const formatPrice = (inputAmount: number, outputAmount: number, tx: RouteHistoryAlias): string => {
    return tx.type == RouteHistoryType.CRYPTO
      ? `${formatAmount(new BigNumber(inputAmount / outputAmount).precision(5).toNumber())}`
      : tx.type == RouteHistoryType.BUY
      ? `${formatAmount(round(inputAmount / outputAmount, 2))}`
      : `${formatAmount(round(outputAmount / inputAmount, 2))}`;
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

  const priceOf = (tx: RouteHistoryAlias): string => {
    return tx.inputAmount && tx.outputAmount ? formatPrice(tx.inputAmount, tx.outputAmount, tx) : invalidValue;
  };

  const amlCheckOf = (tx: RouteHistoryAlias, useTranslatedValues = false): string => {
    if (isInvalid(tx.amlCheck)) return invalidValue;
    if (!device.SM && !useTranslatedValues) {
      switch (tx.amlCheck) {
        case AmlCheck.PASS:
          return "\u{2705}";
        case AmlCheck.FAIL:
          return "\u{274C}";
        case AmlCheck.PENDING:
          return "\u{1F503}";
        default:
          return "\u{2753}";
      }
    }
    return t(`model.route.aml_check_${tx.amlCheck.toLowerCase()}`);
  };

  const statusOf = (tx: RouteHistoryAlias): string => {
    if (isInvalid(tx.status)) return invalidValue;
    return t(`model.route.status_${tx.status.toLowerCase()}`);
  };

  const showDetail = (tx: RouteHistoryAlias) => {
    setTransaction(tx);
    setShowsDetail(true);
  };

  const data = (tx: RouteHistoryAlias) => [
    { label: "model.route.date", value: dateOf(tx) },
    { label: "model.route.input", value: inputOf(tx) },
    { label: "model.route.output", value: outputOf(tx) },
    { label: "model.route.price", value: priceOf(tx) },
    { label: "model.route.aml_check", value: amlCheckOf(tx, true) },
    { label: "model.route.status", value: statusOf(tx) },
    {
      label: "model.route.tx_link",
      value: tx.txUrl ? "" : invalidValue,
      icon: tx.txUrl ? iconOpenLink : undefined,
      onPress: () => openUrl(tx.txUrl),
    },
  ];

  return (
    <>
      <DeFiModal isVisible={showsDetail} setIsVisible={setShowsDetail} title={t("model.route.tx_details")}>
        {transaction && (
          <DataTable>
            {data(transaction).map((d) => (
              <TouchableOpacity onPress={d.onPress} key={d.label} disabled={!d.icon || device.SM}>
                <CompactRow style={d.icon ? styles.cleanEnd : {}}>
                  <CompactCell style={styles.default}>{t(d.label)}</CompactCell>
                  {d.value && <CompactCell style={styles.left}>{d.value}</CompactCell>}
                  {d.icon && d.onPress && (
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton icon={d.icon} onPress={device.SM ? d.onPress : undefined} />
                    </CompactCell>
                  )}
                </CompactRow>
              </TouchableOpacity>
            ))}
          </DataTable>
        )}
      </DeFiModal>

      <DataTable>
        <CompactHeader style={styles.cleanEnd}>
          <CompactTitle style={styles.default}>{t("model.route.date")}</CompactTitle>
          {device.MD && (
            <>
              <CompactTitle style={styles.left}>{t("model.route.input")}</CompactTitle>
              <CompactTitle style={styles.left}>{t("model.route.output")}</CompactTitle>
              <CompactTitle style={styles.left}>{t("model.route.price")}</CompactTitle>
            </>
          )}
          <CompactTitle style={device.SM ? styles.left : styles.leftSmall}>
            {device.SM ? t("model.route.aml_check") : t("model.route.aml_check_short")}
          </CompactTitle>
          <CompactTitle style={styles.left}>{t("model.route.status")}</CompactTitle>
          <CompactTitle style={styles.icon}>{device.MD ? t("model.route.link") : ""}</CompactTitle>
        </CompactHeader>
        {history.map((entry, i) => (
          <TouchableOpacity onPress={() => showDetail(entry)} key={i} disabled={device.SM}>
            <CompactRow style={[styles.row, styles.cleanEnd]}>
              <CompactCell style={styles.default}>{dateOf(entry)}</CompactCell>
              {device.MD && (
                <>
                  <CompactCell style={styles.left}>{inputOf(entry)}</CompactCell>
                  <CompactCell style={styles.left}>{outputOf(entry)}</CompactCell>
                  <CompactCell style={styles.left}>{priceOf(entry)}</CompactCell>
                </>
              )}
              <CompactCell style={device.SM ? styles.left : styles.leftSmall}>{amlCheckOf(entry)}</CompactCell>
              <CompactCell style={styles.left}>{statusOf(entry)}</CompactCell>
              <CompactCell style={styles.icon}>
                {device.MD ? (
                  entry.txUrl ? (
                    <IconButton icon={iconOpenLink} onPress={() => openUrl(entry.txUrl)} />
                  ) : (
                    invalidValue
                  )
                ) : (
                  <IconButton icon={iconShowDetail} onPress={() => showDetail(entry)} />
                )}
              </CompactCell>
            </CompactRow>
          </TouchableOpacity>
        ))}
      </DataTable>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    height: 48,
  },
  cleanEnd: {
    paddingRight: 0,
  },
  default: {
    flex: 2,
  },
  left: {
    flex: 2,
    justifyContent: "flex-start",
  },
  leftSmall: {
    flex: 1,
    justifyContent: "flex-start",
  },
  icon: {
    flex: 1,
    justifyContent: "center",
  },
});

export default RouteHistory;
