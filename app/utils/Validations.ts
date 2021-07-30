import i18n from "../i18n/i18n";
import Regex from "./Regex";

export default {
  Required: {
    required: {
      value: true,
      message: i18n.t("validation.required"),
    },
  },

  Iban: {
    pattern: {
      value: Regex.Iban,
      message: i18n.t("validation.pattern_invalid"),
    },
  },

  Mail: {
    pattern: {
      value: Regex.Mail,
      message: i18n.t("validation.pattern_invalid"),
    },
  },

  Ref: {
    pattern: {
      value: /^\d{3}-\d{3}$/,
      message: i18n.t("validation.pattern_invalid"),
    },
  },

  Phone: {
    pattern: {
      value: Regex.Phone,
      message: i18n.t("validation.code_and_number"),
    },
  },

  Address: {
    pattern: {
      value: /^8\w{33}$/,
      message: i18n.t("validation.pattern_invalid"),
    },
  },

  Custom: (validator: (value: any) => true | string) => ({
    validate: validator,
  }),
};
