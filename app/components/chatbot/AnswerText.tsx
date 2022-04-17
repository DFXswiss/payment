import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

const AnswerText = ({
  onSubmit,
}: {
  onSubmit: (value: string) => void;
}) => {
  const [value, setValue] = useState<string>("")

  return (
    <View style={styles.container}>
      <View style={styles.answerContainer}>
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={() => { onSubmit(value) }}
        />
        {/* Krysh: Maybe we will need to add an edit button here, based on answered or not */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  answerContainer: {
    width: '66%',
    height: 50,
  }
})

export default AnswerText;