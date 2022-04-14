import React, { useEffect } from 'react';
import { StyleSheet, View } from "react-native";
import Loading from "../../components/util/Loading";

const ChatbotScreen = ({
  sessionUrl
}: {
  sessionUrl: string;
}) => {
  useEffect(() => {
    console.log(sessionUrl)
  }, []);

  return (
    <View style={styles.container}>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatbotScreen;