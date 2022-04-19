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
  answerItem: ChatbotAnswerItemType | undefined,
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
  type: ChatbotAnswerItemType
  data: string
}

export enum ChatbotAnswerItemType {
  PLAIN = "query:answer:plain",
  DROPDOWN = "query:answer:dropdown",
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