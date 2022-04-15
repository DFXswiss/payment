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
  HEADER = "Header",
  TEXT = "Text",
  TEXTBOX = "Textbox",
  DROPDOWN = "Dropdown",
  LOADING = "Loading",
  BUTTON = "Button",
  TEXTBOX_BUTTON = "Textbox_Button"
}