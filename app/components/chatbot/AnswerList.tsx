import React, { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { RadioButton, Text, TouchableRipple } from "react-native-paper";
import { ChatbotAnswer, ChatbotAnswerData } from "../../models/ChatbotData";
import { chatbotUpdateAnswer } from "../../services/Chatbot";

interface Props {
  onSubmit: (answer: ChatbotAnswer) => void;
  answer?: ChatbotAnswer;
}

const AnswerList = ({
  onSubmit,
  answer,
}: Props) => {
  const [value, setValue] = useState("")

  const itemSelected = (item: ChatbotAnswerData) => {
    answer?.data.forEach((data) => {
      data.isSelected = data.key === item.key
    })
    setValue(item.key)
    if (answer !== undefined) {
      chatbotUpdateAnswer(item.apiElement, answer)
      onSubmit(answer)
    }
  }

  return (
    <View>
      <ScrollView>
        {answer?.data.map((item) => (
          <TouchableRipple key={item.key} onPress={() => itemSelected(item)}>
            <View style={styles.row}>
              <View pointerEvents="none">
                <RadioButton
                  value={item.key}
                  status={item.isSelected ? "checked" : "unchecked"}
                />
              </View>
              <Text>{item.label}</Text>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    paddingHorizontal: 16,
  },
})

export default AnswerList;