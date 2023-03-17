import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TextStyle, View } from "react-native";
import { LinkedAddress, UserDetail } from "../models/User";
import { changeUser } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import SessionService from "../services/SessionService";
import { Text, TouchableRipple } from "react-native-paper";
import Colors from "../config/Colors";
import IconButton from "./util/IconButton";

interface Props {
  user?: UserDetail;
  onChanged: () => void;
}

const ChangeUser = ({ user, onChanged: onChanged }: Props) => {
  const { t } = useTranslation();
  const [loadingAddress, setLoadingAddress] = useState<string>();
  const [linkedAddresses, setLinkedAddresses] = useState<LinkedAddress[]>([]);

  useEffect(() => {
    if (user) setLinkedAddresses(user.linkedAddresses);
  }, []);

  const changeTo = (linkedAddress: LinkedAddress) => {
    if (linkedAddress.address === user?.address) return;

    setLoadingAddress(linkedAddress.address);

    changeUser(linkedAddress)
      .then((token) => SessionService.tokenLogin(token))
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => {
        setLoadingAddress(undefined);
        onChanged();
      });
  };

  const textStyleFor = (linkedAddress: LinkedAddress, isAddress = false): TextStyle[] | undefined => {
    const textStyles: TextStyle[] = [isAddress ? styles.address : styles.blockchain];
    if (linkedAddress.address === user?.address) textStyles.push(styles.current);
    return textStyles;
  };

  return (
    <ScrollView style={styles.scrollView}>
      {linkedAddresses.map((item) => (
        <TouchableRipple key={item.address} onPress={() => changeTo(item)}>
          <View style={styles.row}>
            <View style={styles.container}>
              <Text style={textStyleFor(item, true)}>{item.address}</Text>
              <Text style={textStyleFor(item)}>{item.blockchains.join(", ")}</Text>
            </View>
            <IconButton
              icon="chevron-right"
              onPress={() => changeTo(item)}
              isLoading={loadingAddress === item.address}
            />
          </View>
        </TouchableRipple>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 10,
  },
  address: {
    fontSize: 16,
  },
  blockchain: {
    fontSize: 12,
  },
  current: {
    color: Colors.Primary,
    fontWeight: "bold",
  },
});

export default ChangeUser;
