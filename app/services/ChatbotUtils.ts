import { ChatbotAPIAnswer, ChatbotElement, ChatbotLanguageValues, ChatbotAPIQuestion, ChatbotAPIItem, ChatbotAPIItemType, ChatbotList, ChatbotAnswerData, ChatbotPage, ChatbotAnswer, ChatbotQuestion, ChatbotAPIState, ChatbotAPIItemKind } from "../models/ChatbotData"

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export const chatbotStart = (): ChatbotAPIAnswer => {
  return { items: [], attributes: null }
}

export const chatbotFillAnswerWithData = (apiQuestion: ChatbotAPIQuestion, answer: ChatbotAnswer) => {
  let apiItems = apiQuestion.items as ChatbotAPIItem[]
  // if there are no items to parse just return no pages
  if (apiItems === undefined || apiItems === null || apiItems.length === 0) {
    return
  }
  // filter for answers
  apiItems = apiItems.filter(item => item.type.startsWith("query:answer"))
  const lastAnswer = apiItems.splice(-1)[0]
  if (lastAnswer !== undefined) {
    restoreAnswerValues(lastAnswer, answer)
  }
}

export const chatbotFeedQuestion = (apiQuestion: ChatbotAPIQuestion, language?: string): [ChatbotPage[], boolean, string?] => {
  const items: ChatbotQuestion[] = []
  let apiItems = apiQuestion.items as ChatbotAPIItem[]
  // if there are no items to parse just return no pages
  if (apiItems === undefined || apiItems === null || apiItems.length === 0) {
    return [[], false]
  }
  // remove all answers
  apiItems = apiItems.filter(item => !item.type.startsWith("query:answer"))
  // parse each item left as question
  apiItems.forEach((item) => {
    items.push(parseQuestion(item, items.length, language))
  })
  // check chat state if we should finish
  const shouldFinish = apiQuestion.chatState === ChatbotAPIState.FINISH
  let question: ChatbotQuestion|undefined
  // if we aren't able to finish, pop last item and save it as question, this will be needed later on
  if (!shouldFinish) {
    question = items.pop()
  }
  // check chat state if help got returned
  if (apiQuestion.chatState === ChatbotAPIState.HELP) {
    // return empty pages, but localized text as string
    return [[], false, question?.label]
  }
  // create an answer based on last question
  const answer = answerBasedOn(apiItems.slice(-1)[0], language, question)
  const pages: ChatbotPage[] = []
  // each question should represent a single page
  if (items.length > 0) {
    const header = items[0].label
    const body = items.slice(1).map((item) => {return item.label}).join('\n')
    pages.push({header: header, body: body, answer: undefined})
  }
  // if we aren't able to finish, check if we have a multiline header
  if (!shouldFinish) {
    const multilineHeader = question?.label.split('\n')
    if (multilineHeader !== undefined && multilineHeader.length > 1) {
      pages.push({header: multilineHeader[0], body: multilineHeader.slice(1).join('\n'), answer: answer})
    } else {
      pages.push({header: question?.label, body: undefined, answer: answer})
    }
  }
  return [pages, shouldFinish]
}

export const chatbotRestorePages = (apiQuestion: ChatbotAPIQuestion, language?: string): ChatbotPage[] => {
  const apiItems = apiQuestion.items as ChatbotAPIItem[]
  let pages: ChatbotPage[] = []
  let itemsToFeed: ChatbotAPIItem[] = []
  apiItems.forEach((item) => {
    if (item.sequence === 0 && itemsToFeed.length > 0) {
      const newPages = restorePages(itemsToFeed, item, language)
      pages = pages.concat(newPages)
      itemsToFeed = []
    } else {
      itemsToFeed.push(item)
    }
  })
  // check if items to feed is empty, if not there is still a page to be restored
  if (itemsToFeed.length > 0) {
    const newPages = restorePages(itemsToFeed, undefined, language)
    pages = pages.concat(newPages)
  }
  return pages
}

const restorePages = (items: ChatbotAPIItem[], item?: ChatbotAPIItem, language?: string): ChatbotPage[] => {
  const question = {items: items, chatState: "TEXT"}
  const [newPages] = chatbotFeedQuestion(question, language)
  if (item !== undefined && item.kind === ChatbotAPIItemKind.INPUT) {
    const lastPage = newPages.slice(-1)[0]
    restoreAnswerValues(item, lastPage.answer)
  }
  return newPages
}

const restoreAnswerValues = (item: ChatbotAPIItem, answer?: ChatbotAnswer) => {
  if (answer === undefined) {
      return
  }
  // Krysh: there are two different types of answers
  // 1) only strings, should be parse to correctly display
  // 2) objects, should not get parsed
  const parsedData = JSON.parse(item.data)
  if (typeof(parsedData) === 'string') {
    answer.previousSentValue = parsedData
  } else {
    answer.previousSentValue = item.data
  }
  answer.timestamp = item.time
}

export const chatbotUpdateAnswer = (value: string, answer?: ChatbotAnswer) => {
  if (answer !== undefined) {
    answer.value = value
  }
}

export const chatbotShouldSendAnswer = (answer: ChatbotAnswer): boolean => {
  let value = answer.value
  if (typeof(value) === 'object') {
    value = JSON.stringify(value)
  }
  let previousSentValue = answer.previousSentValue
  if (typeof(previousSentValue) === 'object') {
    previousSentValue = JSON.stringify(previousSentValue)
  }
  return value.length > 0 && value !== previousSentValue
}

export const chatbotIsEdit = (answer: ChatbotAnswer): boolean => {
  return answer.previousSentValue.length > 0 && answer.timestamp > 0
}

export const chatbotCreateAnswer = (value: string, answer: ChatbotAnswer): ChatbotAPIAnswer => {
  if (answer.apiType === undefined) {
    return { items: [], attributes: null }
  }

  const answerItem = {
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
    case ChatbotAPIItemType.HELP:
    case ChatbotAPIItemType.OUTPUT:
    case ChatbotAPIItemType.PLAIN:
      const values = JSON.parse(item.data) as ChatbotLanguageValues
      label = getLocalizedValueFrom(values, language)
      break
    case ChatbotAPIItemType.ANSWER_PLAIN:
      label = JSON.parse(item.data)
      break
    case ChatbotAPIItemType.DROPDOWN:
    case ChatbotAPIItemType.SELECTION:
    case ChatbotAPIItemType.ANSWER_SELECTION:
      const dropdownData = JSON.parse(item.data) as ChatbotList
      label = getLocalizedValueFrom(dropdownData.text, language)
      break
  }
  return {
    key: index,
    label: replaceAll(label, "<br>", "\n"),
  }
}

/// Actually creates the answer element which is shown based on given item
const answerBasedOn = (item: ChatbotAPIItem, language?: string, question?: ChatbotQuestion): ChatbotAnswer => {
  const data: ChatbotAnswerData[] = []
  let dateFormat
  let apiType
  let element = ChatbotElement.TEXT
  switch (item.type) {
    case ChatbotAPIItemType.PLAIN:
      apiType = ChatbotAPIItemType.ANSWER_PLAIN
      element = ChatbotElement.TEXTBOX
      const [isDate, foundDateFormat] = findDateFormat(question?.label)
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
      const dropdownData = JSON.parse(item.data) as ChatbotList
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
    previousSentValue: "",
    timestamp: 0,
  }
}

const findDateFormat = (label?: string): [boolean, string?] => {
  if (label === undefined) { return [false, undefined] }
  let result = false
  let dateFormat
  const start = label?.indexOf('(')
  const end = label?.indexOf(')')
  // (DD.MM.YYYY) gap between index of ( and ) is 11
  if (end - start === 11) {
    dateFormat = label?.substring(start + 1, end)
    result = true
  }
  return [result, dateFormat]
}