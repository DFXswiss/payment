import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import { RadioButton, Text, TouchableRipple } from "react-native-paper";
import { SpacerV } from "../../elements/Spacers";
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
  const { t } = useTranslation();
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<ChatbotAnswerData[]>([])

  useEffect(() => {
    if (answer !== undefined) {
      setItems(answer.data)
      if (answer.value !== undefined && answer.value.length > 0) {
        itemSelected(JSON.parse(answer.value) as ChatbotAnswerData)
      }
    }
  }, [answer])

  const itemSelected = (item: ChatbotAnswerData) => {
    answer?.data.forEach((data) => {
      data.isSelected = data.key === item.key
    })
    setValue(item.key)
    if (answer !== undefined && item.apiElement !== undefined) {
      chatbotUpdateAnswer(item.apiElement, answer)
      onSubmit(answer)
    }
  }

  const update = (search: string) => {
    setSearch(search)
    if (answer !== undefined) {
      if (search.length === 0) {
        setItems(answer.data)
      } else {
        setItems(answer.data.filter((item) => { 
          return item.label.toLowerCase().includes(search.toLocaleLowerCase()) || item.isSelected
        }))
      }
    }
  }

  return (
    <View style={styles.container}>
      {(answer?.data.length ?? 0) >= 10 && (
        <View>
          <TextInput
            inlineImageLeft="search"
            placeholder={t("kyc.bot.search")}
            onChangeText={(text) => { 
              update(text)
            }}
            value={search}
          />
          <SpacerV />
        </View>
      )}
      <ScrollView>
        {items.map((item) => (
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
  container: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
})

export default AnswerList;