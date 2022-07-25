import React, { createRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import { RadioButton, Text, TouchableRipple } from "react-native-paper";
import { SpacerV } from "../../elements/Spacers";
import { ChatbotAnswer, ChatbotAnswerData } from "../../models/ChatbotData";
import { chatbotLocalize, chatbotUpdateAnswer } from "../../services/chatbot/ChatbotUtils";

interface Props {
  onSubmit: (answer: ChatbotAnswer) => void;
  answer?: ChatbotAnswer;
  language?: string;
}

const AnswerList = ({
  onSubmit,
  answer,
  language,
}: Props) => {
  const { t } = useTranslation()
  const scrollViewRef = createRef<ScrollView>()
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<ChatbotAnswerData[]>([])

  useEffect(() => {
    setSearch("")
    setValue("")
    if (answer !== undefined) {
      setItems(answer.data)
      if (answer.previousSentValue !== undefined && answer.previousSentValue.length > 0) {
        itemSelected(JSON.parse(answer.previousSentValue) as ChatbotAnswerData)
      }
    }
    scrollViewRef.current?.scrollTo({x: 0, y: 0, animated: false})
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
          let label = chatbotLocalize(item.label, language)
          return label.toLowerCase().includes(search.toLocaleLowerCase()) || item.isSelected
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
            placeholder={t("action.search")}
            onChangeText={(text) => { 
              update(text)
            }}
            value={search}
          />
          <SpacerV />
        </View>
      )}
      <ScrollView ref={scrollViewRef}>
        {items.map((item) => (
          <TouchableRipple key={item.key} onPress={() => itemSelected(item)}>
            <View style={styles.row}>
              <View pointerEvents="none">
                <RadioButton
                  value={item.key}
                  status={item.isSelected ? "checked" : "unchecked"}
                />
              </View>
              <Text>{ chatbotLocalize(item.label, language) }</Text>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 150,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
})

export default AnswerList;
