export interface ChatbotAuthenticationInfo {
  secretTitle: ChatbotLanguageValues;
  secretLabel: ChatbotLanguageValues;
  secretIncorrect: ChatbotLanguageValues;
}

export interface ChatbotLanguageValues {
  en: string;
  de: string;
  fr: string;
}

export enum ChatbotElement {
  TEXT = "Text",
  TEXTBOX = "Textbox",
  DROPDOWN = "Dropdown",
  LOADING = "Loading",
}

export interface ChatbotMessage {
  id: number,
  type: ChatbotMessageType
  label: string | undefined,
  element: ChatbotElement,
  itemType: ChatbotItemType | undefined,
  answerData: ChatbotAnswerData[] | undefined,
}

export enum ChatbotMessageType {
  QUESTION = "question",
  ANSWER = "answer",
}

export interface ChatbotQuestion {
  items?: object,
  attributes?: object,
  chatState?: string,
  error?: any,
}

export interface ChatbotItem {
  data: string,
  kind: ChatbotItemKind,
  sequence: number,
  time: number,
  type: ChatbotItemType,
}

export enum ChatbotItemType {
  OUTPUT = "output:text:plain",
  PLAIN = "query:text:plain",
  DROPDOWN = "query:text:dropdown",
  ANSWER_PLAIN = "query:answer:plain",
  ANSWER_DROPDOWN = "query:answer:dropdown",
  ANSWER_SELECTION = "query:answer:selection",
}

export enum ChatbotItemKind {
  OUTPUT = "OUTPUT",
  INPUT = "INPUT",
}

export interface ChatbotAnswer {
  items: [ChatbotAnswerItem] | []
  attributes: null
}

export interface ChatbotAnswerItem {
  type: ChatbotItemType
  data: string
}

export interface ChatbotAnswerData {
  key: string
  label: string
  isSelected: Boolean
  chatbotElement: any
}

export interface ChatbotDropdownData {
  text: ChatbotLanguageValues
  selection: [ChatbotDropdownDataItem]
  sort: Boolean
}

export interface ChatbotDropdownDataItem {
  key: string,
  text: ChatbotLanguageValues
}