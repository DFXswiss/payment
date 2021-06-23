import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Environment } from "../env/Environment";
import SettingsService from "../services/SettingsService";

export const languages = ["de", "en"];

i18n.use(initReactI18next).init({
  resources: languages.reduce((obj, lang) => ({ ...obj, [lang]: require(`./${lang}.json`) }), {}),
  fallbackLng: Environment.defaultLanguage,
  debug: Environment.debug,
  ns: ["common"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  SettingsService.updateSettings({ language: language });
};
