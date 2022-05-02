import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ChatbotAnswerData, ChatbotMessage } from "../../models/ChatbotData";
import DeFiDropdown from "../form/DeFiDropdown";

interface Props {
  onSubmit: (value: string) => void;
  message: ChatbotMessage;
}

const AnswerDropdown = ({
  onSubmit,
  message,
}: Props) => {

  return (
    <DeFiDropdown
      value={message.answerData?.find((value) => {
        return value.isSelected
      })}
      setValue={value => {
        message.answerData?.forEach((item) => item.isSelected = false)
        let answerData = value as ChatbotAnswerData
        answerData.isSelected = true
        onSubmit(answerData.chatbotElement)
      }}
      items={message.answerData ?? []}
      idProp="key"
      labelProp="label"
      style={styles.answerDropdown}
    />
  )
}

const styles = StyleSheet.create({
  answerDropdown: {
    alignSelf: 'flex-end',
  }
})

export default AnswerDropdown;