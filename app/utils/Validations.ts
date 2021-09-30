import i18n from "../i18n/i18n";
import Regex from "./Regex";

class ValidationsClass {
  public get Required() {
    return {
      required: {
        value: true,
        message: i18n.t("validation.required"),
      },
    };
  }

  public get Iban() {
    return {
      pattern: {
        value: Regex.Iban,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Mail() {
    return {
      pattern: {
        value: Regex.Mail,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Ref() {
    return {
      pattern: {
        value: /^\d{3}-\d{3}$/,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Phone() {
    return {
      pattern: {
        value: Regex.Phone,
        message: i18n.t("validation.code_and_number"),
      },
    };
  }

  public get Address() {
    return {
      pattern: {
        value: /^(8\w{33}|d\w{33}|d\w{41})$/,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public Custom = (validator: (value: any) => true | string) => ({
    validate: validator,
  });
}

const Validations = new ValidationsClass();
export default Validations;
