import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TextStyle, View } from "react-native";
import { LinkedAddress, UserDetail } from "../models/User";
import { changeUser } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import SessionService from "../services/SessionService";
import { Text, TouchableRipple } from "react-native-paper";
import Colors from "../config/Colors";

interface Props {
  user?: UserDetail;
  onSubmit: () => void;
}

const ChangeUser = ({ user, onSubmit }: Props) => {
  const { t } = useTranslation();
  const [linkedAddresses, setLinkedAddresses] = useState<LinkedAddress[]>([]);

  useEffect(() => {
    const availableAddresses = user?.linkedAddresses ?? [];
    setLinkedAddresses(availableAddresses);
  }, []);

  const changeTo = (linkedAddress?: LinkedAddress) => {
    if (!linkedAddress || linkedAddress.address === user?.address) return;

    if (!linkedAddress.isSwitchable) {
      NotificationService.warn(t("feedback.change_user_security"));
      return;
    }

    changeUser(linkedAddress)
      .then((token) => SessionService.tokenLogin(token))
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(onSubmit);
  };

  const textStyleFor = (linkedAddress: LinkedAddress, isAddress = false): TextStyle[] | undefined => {
    const textStyles = [];
    isAddress ? textStyles.push(styles.address) : textStyles.push(styles.blockchain);
    if (linkedAddress.address === user?.address) textStyles.push(styles.current);
    else if (!linkedAddress.isSwitchable) textStyles.push(styles.disabled);
    return textStyles;
  };

  return (
    <ScrollView style={styles.scrollView}>
      {linkedAddresses.map((item) => (
        <TouchableRipple key={item.address} onPress={() => changeTo(item)}>
          <View style={styles.row}>
            <View style={styles.container}>
              <Text style={textStyleFor(item, true)}>{item.address}</Text>
              <Text style={textStyleFor(item)}>{item.blockchain}</Text>
            </View>
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
  disabled: {
    color: Colors.LightGrey,
  },
});

export default ChangeUser;
