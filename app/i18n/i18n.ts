import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Environment } from "../env/Environment";

export interface Language {
  label: string;
  key: string;
}

export const Languages: Language[] = [
  { label: "Deutsch", key: "de" },
  { label: "English", key: "en" },
];

i18n.use(initReactI18next).init({
  resources: Languages.reduce((obj, lang) => ({ ...obj, [lang.key]: require(`./${lang.key}.json`) }), {}),
  fallbackLng: Environment.defaultLanguage,
  debug: Environment.debug,
  ns: ["common"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
