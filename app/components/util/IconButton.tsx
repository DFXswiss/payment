import React from "react";
import { StyleSheet, TextStyle, View } from "react-native";
import { IconButton as PaperIconButton } from "react-native-paper";
import Colors from "../../config/Colors";
import AppStyles, { DefaultCursor } from "../../styles/AppStyles";
import Loading from "./Loading";

const IconButton = ({
  icon,
  onPress,
  style,
  size,
  color = Colors.Primary,
  isLoading = false,
  disabled = false,
}: {
  icon: string;
  onPress?: () => void;
  style?: TextStyle;
  size?: number;
  color?: string;
  isLoading?: boolean;
  disabled?: boolean;
}) => (
  <View style={style}>
    {isLoading && (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    )}
    <PaperIconButton
      icon={icon}
      color={color}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[disabled && styles.disabled, isLoading && AppStyles.hidden]}
      size={size}
    ></PaperIconButton>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    ...DefaultCursor
  }
});

export default IconButton;
