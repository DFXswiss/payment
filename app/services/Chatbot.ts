import { ChatbotAnswer, ChatbotAnswerItemType, ChatbotElement, ChatbotLanguageValues, ChatbotMessage, ChatbotMessageType, ChatbotQuestion, ChatbotQuestionItem, ChatbotQuestionItemType } from "../models/ChatbotData"

// { id: 0, condition: Boolean(authenticationInfo?.secretTitle.en), label: authenticationInfo?.secretTitle.en, element: ChatbotElement.HEADER },
// { id: 1, condition: Boolean(authenticationInfo?.secretLabel.en), label: authenticationInfo?.secretLabel.en, element: ChatbotElement.TEXT },
// { id: 2, condition: !hasSentSMS, element: ChatbotElement.LOADING },
// { id: 3, condition: hasSentSMS, label: ["Your SMS code", "Send"], element: ChatbotElement.TEXTBOX_BUTTON },

export const chatbotStart = (): ChatbotAnswer => {
  return { items: [], attributes: null }
}

export const chatbotFeedQuestion = (question: ChatbotQuestion, messages?: [ChatbotMessage]): [ChatbotMessage] | undefined => {
  console.log("question:")
  console.log(question)
  let items = question.items as [ChatbotQuestionItem]
  items.filter(item => !item.type.startsWith("query:answer"))
  items.forEach((item) => {
    let message = parseQuestionItem(item, messages?.length ?? 0)
    if (messages === undefined) {
      messages = [message]
    } else {
      messages.push(message)
    }
  })
  let answer = answerBasedOn(items.slice(-1)[0].type, messages?.length ?? 0)
  console.log("answerElement:")
  console.log(answer)
  if (answer !== undefined) messages?.push(answer)
  return messages
}

/*
{
  "items": [
    {
      "type": "query:answer:plain",
      "data": "\"01.01.1980\""
    }
  ],
  "attributes": null
}
*/

export const chatbotCreateAnswer = (value: string, messages: [ChatbotMessage]): ChatbotAnswer => {
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

const parseQuestionItem = (item: ChatbotQuestionItem, index: number): ChatbotMessage => {
  let labels = JSON.parse(item.data) as ChatbotLanguageValues
  return {
    id: index,
    type: ChatbotMessageType.QUESTION,
    label: labels.en,
    element: ChatbotElement.TEXT,
    answerItem: undefined,
  }
}

const answerBasedOn = (questionItemType: ChatbotQuestionItemType, index: number): ChatbotMessage => {
  let answerItemType
  let answerElement = ChatbotElement.TEXT
  switch (questionItemType) {
    case ChatbotQuestionItemType.PLAIN:
      answerItemType = ChatbotAnswerItemType.PLAIN
      answerElement = ChatbotElement.TEXTBOX
    case ChatbotQuestionItemType.DROPDOWN:
      answerItemType = ChatbotAnswerItemType.DROPDOWN
  }
  return {
    id: index,
    type: ChatbotMessageType.ANSWER,
    label: undefined,
    element: answerElement,
    answerItem: answerItemType
  }
}