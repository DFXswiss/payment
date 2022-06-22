import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import { ChatbotAnswer } from "../../models/ChatbotData";
import { chatbotUpdateAnswer } from "../../services/Chatbot";

interface Props {
  onSubmit: (answer: ChatbotAnswer) => void;
  answer?: ChatbotAnswer;
}

const AnswerDatePicker = ({
  onSubmit,
  answer,
}: Props) => {
  const [date, setDate] = useState<string>('')
  const [dateFormat, setDateFormat] = useState<string>('')
  const callSubmit = (value: string) => {
    if (answer !== undefined) {
      chatbotUpdateAnswer(value, answer)
      onSubmit(answer)
    }
  }

  useEffect(() => {
    if (answer !== undefined) {
      setDateFormat(answer.dateFormat as string)
      if (answer.value !== undefined) {
        setDate(answer.value)
      }
    }
  }, [])

  return (
    <View style={styles.container}>
      <TextInput
          value={date}
          placeholder={dateFormat}
          onChangeText={(input) => {
            setDate(input)
            callSubmit(input)
          }}
          onSubmitEditing={() => { 
            callSubmit(date)
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