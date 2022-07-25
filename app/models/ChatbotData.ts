export type ChatbotLanguageValues = {[language: string] : string}

export enum ChatbotStatus {
  INITIAL = "INITIAL",
  STARTED = "STARTED",
}

export interface ChatbotPage {
  header?: ChatbotLanguageValues,
  body?: ChatbotLanguageValues,
  bodyHasSupportLink: boolean,
  answer?: ChatbotAnswer,
}

export enum ChatbotElement {
  TEXT = "Text",
  TEXTBOX = "Textbox",
  LIST = "List",
  LOADING = "Loading",
  DATE = "DatePicker",
}

export interface ChatbotInfo {
  key: number,
  label: string,
}

export interface ChatbotQuestion {
  key: number,
  label: ChatbotLanguageValues,
}

export interface ChatbotAnswer {
  apiType: ChatbotAPIItemType,
  element: ChatbotElement,
  data: ChatbotAnswerData[],
  dateFormat?: string,
  value: string,
  previousSentValue: string,
  timestamp: number,
  hasChanged: boolean,
}

export interface ChatbotAPIQuestion {
  items?: object,
  attributes?: any,
  chatState?: string,
  error?: any,
}

export interface ChatbotAPIConfirmations {
  confirmsForm: string,
  informsOfChanges: string,
}

export enum ChatbotAPIState {
  HELP = "HELP",
  CONTINUE = "TEXT",
  FINISH = "DONE"
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
  HELP = "query:help:plain",
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
  label: ChatbotLanguageValues
  isSelected: boolean
  apiElement: any
}

export interface ChatbotList {
  text: ChatbotLanguageValues
  selection: ChatbotListItem[]
  sort: boolean
}

export interface ChatbotListItem {
  key: string
  text: ChatbotLanguageValues
  prefix?: string
}