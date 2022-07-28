import { ChatbotAnswer, ChatbotPage, ChatbotAnswerData, ChatbotLanguageValues } from "../../models/ChatbotData";

export enum ChatbotAutoAnswer {
  CHF_0_COMING_FROM
}

export const shouldAutoAnswer = (pages?: ChatbotPage[]): ChatbotAutoAnswer|undefined => {
  if (pages === undefined) {
    return undefined
  }
  if (doesHeaderContain("CHF 0", "en", pages[pages.length - 1].header)) {
    return ChatbotAutoAnswer.CHF_0_COMING_FROM
  }
  return undefined
}

export const createAutoAnswer = (autoAnswer: ChatbotAutoAnswer, answer?: ChatbotAnswer): ChatbotAnswer|undefined => {
  switch (autoAnswer) {
    case ChatbotAutoAnswer.CHF_0_COMING_FROM:
      if (answer !== undefined) {
        answer.value = getValueWithKey(answer.data, "SAVINGS")
      }
      return answer
  }
  return undefined
}

const getValueWithKey = (values: ChatbotAnswerData[], key: string): string => {
  const foundValue = values.find((value) => {
    return value.key === key
  })
  return foundValue?.apiElement ?? ""
}

const doesHeaderContain = (needle: string, language: string, haystack?: ChatbotLanguageValues): boolean => {
  return haystack?.[language].includes(needle) ?? false
}