import { ChatbotAnswer, ChatbotAnswerItemType, ChatbotElement, ChatbotLanguageValues, ChatbotMessage, ChatbotMessageType, ChatbotQuestion, ChatbotItem, ChatbotItemType, ChatbotItemKind, ChatbotDropdownData, ChatbotAnswerData } from "../models/ChatbotData"

// { id: 0, condition: Boolean(authenticationInfo?.secretTitle.en), label: authenticationInfo?.secretTitle.en, element: ChatbotElement.HEADER },
// { id: 1, condition: Boolean(authenticationInfo?.secretLabel.en), label: authenticationInfo?.secretLabel.en, element: ChatbotElement.TEXT },
// { id: 2, condition: !hasSentSMS, element: ChatbotElement.LOADING },
// { id: 3, condition: hasSentSMS, label: ["Your SMS code", "Send"], element: ChatbotElement.TEXTBOX_BUTTON },

export const chatbotStart = (): ChatbotAnswer => {
  return { items: [], attributes: null }
}

export const chatbotFeedQuestion = (question: ChatbotQuestion, messages?: ChatbotMessage[]): ChatbotMessage[] => {
  let outputMessages: ChatbotMessage[] = []
  if (messages !== undefined) {
    outputMessages.push(...messages)
  }
  console.log("question:")
  console.log(question)
  let items = question.items as ChatbotItem[]
  items.filter(item => !item.type.startsWith("query:answer"))
  items.forEach((item) => {
    let message = parseItem(item, outputMessages.length)
    outputMessages.push(message)
  })
  let answer = answerBasedOn(items.slice(-1)[0], outputMessages.length)
  console.log("answerElement:")
  console.log(answer)
  if (answer !== undefined) outputMessages.push(answer)
  console.log(outputMessages)
  return outputMessages
}

export const chatbotCreateAnswer = (value: string, messages: ChatbotMessage[]): ChatbotAnswer => {
  let lastMessage = messages.splice(-1)[0]

  if (lastMessage.answerItem === undefined) {
    return { items: [], attributes: null }
  }
  
  let answerItem = {
    type: lastMessage.answerItem,
    data: value,
  }
  return { items: [answerItem], attributes: null }
}

const parseItem = (item: ChatbotItem, index: number): ChatbotMessage => {
  let label = JSON.parse(item.data)
  if (item.kind === ChatbotItemKind.OUTPUT) {
    switch (item.type) {
      case ChatbotItemType.OUTPUT: 
      case ChatbotItemType.PLAIN:
        let values = JSON.parse(item.data) as ChatbotLanguageValues
        label = values.en
        break
      case ChatbotItemType.DROPDOWN:
        let dropdownData = JSON.parse(item.data) as ChatbotDropdownData
        label = dropdownData.text.en
        break
    }
  }
  return {
    id: index,
    type: item.kind === ChatbotItemKind.INPUT ? ChatbotMessageType.ANSWER : ChatbotMessageType.QUESTION,
    label: label,
    element: ChatbotElement.TEXT,
    answerItem: undefined,
    answerData: undefined,
  }
}

const answerBasedOn = (item: ChatbotItem, index: number): ChatbotMessage => {
  let answerData: ChatbotAnswerData[] = []
  let answerItemType
  let answerElement = ChatbotElement.TEXT
  switch (item.type) {
    case ChatbotItemType.PLAIN:
      answerItemType = ChatbotAnswerItemType.PLAIN
      answerElement = ChatbotElement.TEXTBOX
      break
    case ChatbotItemType.DROPDOWN:
      answerItemType = ChatbotAnswerItemType.DROPDOWN
      answerElement = ChatbotElement.DROPDOWN
      let dropdownData = JSON.parse(item.data) as ChatbotDropdownData
      answerData.push({key: "dfx_initial", label: "Choose", isSelected: true, chatbotElement: null})
      answerData.push(...dropdownData.selection.map((item) => {
        return {
          key: item.key,
          label: item.text.en,
          isSelected: false,
          chatbotElement: item,
        }
      }))
      break
  }
  return {
    id: index,
    type: ChatbotMessageType.ANSWER,
    label: undefined,
    element: answerElement,
    answerItem: answerItemType,
    answerData: answerData,
  }
}