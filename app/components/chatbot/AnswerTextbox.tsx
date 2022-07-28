import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { ChatbotAnswer } from "../../models/ChatbotData";
import { chatbotUpdateAnswer } from "../../services/chatbot/ChatbotUtils";

interface Props {
  onSubmit: (answer: ChatbotAnswer, shouldTriggerNext: boolean) => void;
  answer?: ChatbotAnswer;
}

const AnswerTextbox = ({
  onSubmit,
  answer,
}: Props) => {
  const [value, setValue] = useState<string>("")
  const callSubmit = (value: string, shouldTriggerNext: boolean) => {
    if (answer !== undefined) {
      chatbotUpdateAnswer(value, answer)
      onSubmit(answer, shouldTriggerNext)
    }
  }

  useEffect(() => {
    setValue("")
    if (answer !== undefined && answer.previousSentValue !== undefined) {
      setValue(answer.previousSentValue)
    }
  }, [answer])

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={(input) => {
          setValue(input)
          callSubmit(input, false)
        }}
        onSubmitEditing={() => { 
          callSubmit(value, true)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default AnswerTextbox;