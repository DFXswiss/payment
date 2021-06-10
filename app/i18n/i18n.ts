import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: require("./en.json"),
      de: require("./de.json")
    },
    fallbackLng: 'en',
    debug: true,
    ns: ['common'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;