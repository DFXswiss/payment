import React, { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { Spacer } from "../../elements/Spacers";
import { useDevice } from "../../hooks/useDevice";
import AppStyles from "../../styles/AppStyles";

const ButtonContainer = ({ children }: { children: ReactElement | (false | ReactElement)[] }) => {
  const device = useDevice();

  if (!Array.isArray(children)) {
    children = [children];
  }

  children = children
    .filter((c) => c)
    .map((c) => c as ReactElement)
    .reduce((prev: ReactElement[], curr: ReactElement, i) => prev.concat(<Spacer key={"spacer" + i} />, curr), []);
  children.shift();

  if (children.length == 1) {
    children.unshift(<View key="placer" style={styles.placer} />);
  }

  return <View style={device.SM ? [AppStyles.containerHorizontal, styles.large] : styles.small}>{children}</View>;
};

const styles = StyleSheet.create({
  large: {
    justifyContent: "space-between",
  },
  small: {
    flexDirection: "column-reverse",
  },
  placer: {
    width: "auto",
  },
});

export default ButtonContainer;
