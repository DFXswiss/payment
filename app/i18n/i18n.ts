import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { updateSettings } from "../services/SettingsService";

i18n.use(initReactI18next).init({
  resources: {
    de: require("./de.json"),
    en: require("./en.json"),
  },
  fallbackLng: "de",
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
  updateSettings({ language: language });
};
