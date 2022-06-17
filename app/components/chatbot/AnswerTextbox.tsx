import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { ChatbotAnswer } from "../../models/ChatbotData";

interface Props {
  onSubmit: (answer: ChatbotAnswer) => void;
  // value?: string; // TODO: add to have old answer in case of go back
  answer?: ChatbotAnswer;
}

const AnswerTextbox = ({
  onSubmit,
  // value,
  answer,
}: Props) => {
  const [value, setValue] = useState<string>("")
  const callSubmit = (value: string) => {
    if (answer !== undefined) {
      answer.value = value
      onSubmit(answer)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={(input) => {
          setValue(input)
          callSubmit(input)
        }}
        onSubmitEditing={() => { 
          callSubmit(value)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
})

export default AnswerTextbox;