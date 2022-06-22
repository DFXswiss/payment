import { ChatbotAPIAnswer, ChatbotElement, ChatbotLanguageValues, ChatbotAPIQuestion, ChatbotAPIItem, ChatbotAPIItemType, ChatbotList, ChatbotAnswerData, ChatbotPage, ChatbotAnswer, ChatbotQuestion, ChatbotAPIState, ChatbotDateFormat } from "../models/ChatbotData"

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export const chatbotStart = (): ChatbotAPIAnswer => {
  return { items: [], attributes: null }
}

export const chatbotFeedQuestion = (apiQuestion: ChatbotAPIQuestion, language?: string): [ChatbotPage[], boolean] => {
  let items: ChatbotQuestion[] = []
  let apiItems = apiQuestion.items as ChatbotAPIItem[]
  if (apiItems === undefined) {
    return [[], false]
  }
  apiItems = apiItems.filter(item => !item.type.startsWith("query:answer"))
  apiItems.forEach((item) => {
    items.push(parseQuestion(item, items.length, language))
  })
  let shouldFinish = apiQuestion.chatState === ChatbotAPIState.FINISH
  let question
  if (!shouldFinish) {
    question = items.pop()
  }
  let answer = answerBasedOn(apiItems.slice(-1)[0], language, question)
  let pages: ChatbotPage[] = []
  if (items.length > 0) {
    let header = items[0].label
    let body = items.slice(1).map((item) => {return item.label}).join('\n')
    pages.push({header: header, body: body, answer: undefined})
  }
  if (!shouldFinish) {
    let multilineHeader = question?.label.split('\n')
    if (multilineHeader !== undefined && multilineHeader.length > 1) {
      pages.push({header: multilineHeader[0], body: multilineHeader.slice(1).join('\n'), answer: answer})
    } else {
      pages.push({header: question?.label, body: undefined, answer: answer})
    }
  }
  return [pages, shouldFinish]
}

export const chatbotUpdateAnswer = (value: string, answer?: ChatbotAnswer) => {
  if (answer !== undefined) {
    answer.value = value
    answer.shouldTrigger = true
  }
}

export const chatbotCreateAnswer = (value: string, answer: ChatbotAnswer): ChatbotAPIAnswer => {
  answer.shouldTrigger = false
  if (answer.apiType === undefined) {
    return { items: [], attributes: null }
  }

  let answerItem = {
    type: answer.apiType,
    data: JSON.stringify(value),
  }
  return { items: [answerItem], attributes: null }
}

const getLocalizedValueFrom = (values: ChatbotLanguageValues, language?: string): string => {
  if (language === undefined) {
    language = "en"
  }
  return values[language.toLowerCase()] ?? values["en"]
}

/// Parses each item and generates data and assign label
const parseQuestion = (item: ChatbotAPIItem, index: number, language?: string): ChatbotQuestion => {
  let label = ""
  switch (item.type) {
    case ChatbotAPIItemType.OUTPUT:
    case ChatbotAPIItemType.PLAIN:
      let values = JSON.parse(item.data) as ChatbotLanguageValues
      label = getLocalizedValueFrom(values, language)
      break
    case ChatbotAPIItemType.ANSWER_PLAIN:
      label = JSON.parse(item.data)
      break
    case ChatbotAPIItemType.DROPDOWN:
    case ChatbotAPIItemType.SELECTION:
    case ChatbotAPIItemType.ANSWER_SELECTION:
      let dropdownData = JSON.parse(item.data) as ChatbotList
      label = getLocalizedValueFrom(dropdownData.text, language)
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
    key: index,
    label: replaceAll(label, "<br>", "\n"),
  }
}

/// Actually creates the answer element which is shown based on given item
const answerBasedOn = (item: ChatbotAPIItem, language?: string, question?: ChatbotQuestion): ChatbotAnswer => {
  let data: ChatbotAnswerData[] = []
  let dateFormat
  let apiType
  let element = ChatbotElement.TEXT
  switch (item.type) {
    case ChatbotAPIItemType.PLAIN:
      apiType = ChatbotAPIItemType.ANSWER_PLAIN
      element = ChatbotElement.TEXTBOX
      let [isDate, foundDateFormat] = findDateFormat(question?.label)
      if (isDate && question !== undefined && foundDateFormat !== undefined) {
        question.label = question.label.replace(foundDateFormat, "")
          .replace("(", "")
          .replace(")", "")
          .trim()
        element = ChatbotElement.DATE
        dateFormat = foundDateFormat
      }
      break
    case ChatbotAPIItemType.DROPDOWN:
    case ChatbotAPIItemType.SELECTION:
      apiType = ChatbotAPIItemType.ANSWER_SELECTION
      element = ChatbotElement.LIST
      let dropdownData = JSON.parse(item.data) as ChatbotList
      data.push(...dropdownData.selection.map((item) => {
        delete item.prefix
        return {
          key: item.key,
          label: getLocalizedValueFrom(item.text, language),
          isSelected: false,
          apiElement: item,
        }
      }))
      break
  }
  return {
    apiType: apiType ?? ChatbotAPIItemType.PLAIN,
    element: element,
    data: data,
    dateFormat: dateFormat,
    value: "",
    shouldTrigger: false,
  }
}

const dateformats = [ChatbotDateFormat.STANDARD, ChatbotDateFormat.US, ChatbotDateFormat.REVERSE]

const findDateFormat = (label?: string): [boolean, ChatbotDateFormat?] => {
  if (label === undefined) { return [false, undefined] }
  let result = false
  let format
  dateformats.forEach((dateFormat) => {
    let foundFormat = label?.includes(dateFormat)
    result = result || foundFormat
    if (foundFormat) {
      format = dateFormat
    }
  })
  return [result, format]
}