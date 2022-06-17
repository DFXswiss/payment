import { ChatbotAnswer, ChatbotElement, ChatbotLanguageValues, ChatbotMessage, ChatbotMessageType, ChatbotQuestion, ChatbotItem, ChatbotItemType, ChatbotItemKind, ChatbotDropdownData, ChatbotAnswerData } from "../models/ChatbotData"

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export const chatbotStart = (): ChatbotAnswer => {
  return { items: [], attributes: null }
}

export const chatbotFeedQuestion = (question: ChatbotQuestion, messages?: ChatbotMessage[]): [ChatbotMessage[], boolean] => {
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
  let lastItem = items.slice(-1)[0]
  if (lastItem.type === ChatbotItemType.OUTPUT) {
    return [outputMessages, true]
  }
  let answer = answerBasedOn(lastItem, outputMessages.length)
  console.log("answerElement:")
  console.log(answer)
  if (answer !== undefined) outputMessages.push(answer)
  console.log(outputMessages)
  return [outputMessages, false]
}

export const chatbotCreateAnswer = (value: string, messages: ChatbotMessage[]): ChatbotAnswer => {
  let lastMessage = messages.splice(-1)[0]

  if (lastMessage.itemType === undefined) {
    return { items: [], attributes: null }
  }

  let answerItem = {
    type: lastMessage.itemType,
    data: JSON.stringify(value),
  }
  return { items: [answerItem], attributes: null }
}

/// Parses each item and generates data and assign label
const parseItem = (item: ChatbotItem, index: number): ChatbotMessage => {
  let label = ""
  switch (item.type) {
    case ChatbotItemType.OUTPUT:
    case ChatbotItemType.PLAIN:
      let values = JSON.parse(item.data) as ChatbotLanguageValues
      label = values.en // TODO: localize this
      break
    case ChatbotItemType.ANSWER_PLAIN:
      label = JSON.parse(item.data)
      break
    case ChatbotItemType.DROPDOWN:
    case ChatbotItemType.SELECTION:
    case ChatbotItemType.ANSWER_SELECTION:
      let dropdownData = JSON.parse(item.data) as ChatbotDropdownData
      label = dropdownData.text.en // TODO: localize this
      break
  }
  // Krysh: only here for debugging, should be deleted
  if (label === "" || typeof (label) === "object" || label === undefined) {
    console.warn("kind: " + item.kind)
    console.warn("type: " + item.type)
    console.warn(item.data)
    label = "Something on parsing is wrong"
  }
  return {
    id: index,
    type: item.kind === ChatbotItemKind.INPUT ? ChatbotMessageType.ANSWER : ChatbotMessageType.QUESTION,
    label: replaceAll(label, "<br>", "\n"),
    element: ChatbotElement.TEXT,
    itemType: undefined,
    answerData: undefined,
  }
}

/// Actually creates the answer element which is shown based on given item
const answerBasedOn = (item: ChatbotItem, index: number): ChatbotMessage => {
  let answerData: ChatbotAnswerData[] = []
  let itemType
  let answerElement = ChatbotElement.TEXT
  switch (item.type) {
    case ChatbotItemType.PLAIN:
      itemType = ChatbotItemType.ANSWER_PLAIN
      answerElement = ChatbotElement.TEXTBOX
      break
    case ChatbotItemType.DROPDOWN:
    case ChatbotItemType.SELECTION:
      itemType = ChatbotItemType.ANSWER_SELECTION
      answerElement = ChatbotElement.DROPDOWN
      let dropdownData = JSON.parse(item.data) as ChatbotDropdownData
      // TODO: localize this
      answerData.push({ key: "dfx_initial", label: "Choose", isSelected: true, chatbotElement: null })
      answerData.push(...dropdownData.selection.map((item) => {
        delete item.prefix
        return {
          key: item.key,
          label: item.text.en, // TODO: localize this
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
    itemType: itemType,
    answerData: answerData,
  }
}