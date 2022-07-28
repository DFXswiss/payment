import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import { ChatbotAnswer } from "../../models/ChatbotData";
import { chatbotUpdateAnswer } from "../../services/chatbot/ChatbotUtils";

interface Props {
  onSubmit: (answer: ChatbotAnswer, shouldTriggerNext: boolean) => void;
  answer?: ChatbotAnswer;
}

const AnswerDatePicker = ({
  onSubmit,
  answer,
}: Props) => {
  const [date, setDate] = useState<string>('')
  const [dateFormat, setDateFormat] = useState<string>('')
  const callSubmit = (value: string, shouldTriggerNext: boolean) => {
    if (answer !== undefined) {
      chatbotUpdateAnswer(value, answer)
      onSubmit(answer, shouldTriggerNext)
    }
  }

  useEffect(() => {
    setDate("")
    setDateFormat("")
    if (answer !== undefined) {
      setDateFormat(answer.dateFormat as string)
      if (answer.previousSentValue !== undefined) {
        setDate(answer.previousSentValue)
      }
    }
  }, [answer, answer?.dateFormat])

  return (
    <View style={styles.container}>
      <TextInput
          value={date}
          placeholder={dateFormat}
          onChangeText={(input) => {
            setDate(input)
            callSubmit(input, false)
          }}
          onSubmitEditing={() => { 
            callSubmit(date, true)
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

export default AnswerDatePicker;