import React from "react";
import { StyleSheet, Button, NativeSyntheticEvent, NativeTouchEvent, View } from "react-native";
import Colors from "../config/Colors";
import AppStyles from "../styles/AppStyles";
import Loading from "./Loading";

interface Props {
  title: string;
  isLoading: boolean;
  onPress: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
}

const LoadingButton = ({ title, isLoading, onPress }: Props) => {
  return (
    <View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      )}
      <View style={isLoading && AppStyles.transparent}>
        <Button color={isLoading ? Colors.LightGrey : Colors.Primary} title={title} onPress={onPress} disabled={isLoading} />
      </View>
    </View>
  );
};

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
});

export default LoadingButton;
