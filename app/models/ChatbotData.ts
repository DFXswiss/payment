export interface ChatbotAuthenticationInfo {
  secretTitle: ChatbotLanguageValues;
  secretLabel: ChatbotLanguageValues;
  secretIncorrect: ChatbotLanguageValues;
}

export interface ChatbotLanguageValues {
  en: string;
  de: string;
  fr: string;
  it: string;
}

export interface ChatbotPage {
  header?: string,
  body?: string,
  answer?: ChatbotAnswer,
}

export enum ChatbotElement {
  TEXT = "Text",
  TEXTBOX = "Textbox",
  LIST = "List",
  LOADING = "Loading",
}

export interface ChatbotInfo {
  key: number,
  label: string,
}

export interface ChatbotQuestion {
  key: number,
  label: string,
  hasAnswer: boolean,
}

export interface ChatbotAnswer {
  apiType: ChatbotAPIItemType,
  element: ChatbotElement,
  data: ChatbotAnswerData[],
  value: string,
  shouldTrigger: boolean,
}

export interface ChatbotAPIQuestion {
  items?: object,
  attributes?: object,
  chatState?: string,
  error?: any,
}

export interface ChatbotAPIItem {
  data: string,
  kind: ChatbotAPIItemKind,
  sequence: number,
  time: number,
  type: ChatbotAPIItemType,
}

export enum ChatbotAPIItemType {
  OUTPUT = "output:text:plain",
  PLAIN = "query:text:plain",
  DROPDOWN = "query:text:dropdown",
  SELECTION = "query:text:selection",
  ANSWER_PLAIN = "query:answer:plain",
  ANSWER_SELECTION = "query:answer:selection",
}

export enum ChatbotAPIItemKind {
  OUTPUT = "OUTPUT",
  INPUT = "INPUT",
}

export interface ChatbotAPIAnswer {
  items: ChatbotAPIAnswerItem[]
  attributes: null
}

export interface ChatbotAPIAnswerItem {
  type: ChatbotAPIItemType
  data: string
}

export interface ChatbotAnswerData {
  key: string
  label: string
  isSelected: Boolean
  apiElement: any
}

export interface ChatbotList {
  text: ChatbotLanguageValues
  selection: ChatbotListItem[]
  sort: Boolean
}

export interface ChatbotListItem {
  key: string
  text: ChatbotLanguageValues
  prefix?: string
}