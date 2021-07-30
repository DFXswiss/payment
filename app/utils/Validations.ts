import { TFunction } from "i18next";
import Regex from "./Regex";

export default {
  Required: (t: TFunction) => ({
    required: {
      value: true,
      message: t("validation.required"),
    },
  }),

  Iban: (t: TFunction) => ({
    pattern: {
      value: Regex.Iban,
      message: t("validation.pattern_invalid"),
    },
  }),

  Mail: (t: TFunction) => ({
    pattern: {
      value: Regex.Mail,
      message: t("validation.pattern_invalid"),
    },
  }),

  Ref: (t: TFunction) => ({
    pattern: {
      value: /^\d{3}-\d{3}$/,
      message: t("validation.pattern_invalid"),
    },
  }),

  Phone: (t: TFunction) => ({
    pattern: {
      value: Regex.Phone,
      message: t("validation.code_and_number"),
    },
  }),

  Address: (t: TFunction) => ({
    pattern: {
      value: /^8\w{33}$/,
      message: t("validation.pattern_invalid"),
    }
  }),

  Custom: (validator: (value: any) => true | string) => ({
    validate: validator
  })
};