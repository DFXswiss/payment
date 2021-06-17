import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import SettingsService from "../services/SettingsService";

export const languages = ["de", "en"];

i18n.use(initReactI18next).init({
  resources: languages.reduce((obj, lang) => ({ ...obj, [lang]: require(`./${lang}.json`) }), {}),
  fallbackLng: languages[0],
  debug: true,
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
