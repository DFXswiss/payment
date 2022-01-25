import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Environment } from "../env/Environment";

i18n.use(initReactI18next).init({
  resources: {
    DE: require("./de.json"),
    EN: require("./en.json"),
    FR: require("./fr.json"),
    IT: require("./it.json"),
    PT: require("./pt.json"),
    ES: require("./es.json"),
  },
  fallbackLng: Environment.defaultLanguage,
  debug: Environment.debug,
  ns: ["common"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
