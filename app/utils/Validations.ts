import i18n from "../i18n/i18n";
import Regex from "./Regex";
import * as IbanTools from "ibantools";
import { Country } from "../models/Country";
import { PhoneNumberUtil } from "google-libphonenumber";
import { Environment } from "../env/Environment";
import BlockedIbans from "../assets/blocked-iban.json";

class ValidationsClass {
  public get Required() {
    return {
      required: {
        value: true,
        message: i18n.t("validation.required"),
      },
    };
  }

  public Iban(countries: Country[]) {
    return this.Custom((iban: string) => {
      iban = iban.split(" ").join("");

      // check country
      const allowedCountries = countries.map((c) => c.symbol.toLowerCase());
      if (iban.length >= 2 && !allowedCountries.find((c) => iban.toLowerCase().startsWith(c))) {
        return "validation.iban_country_invalid";
      }

      // check blocked IBANs
      const blockedIbans = BlockedIbans.map((i) => i.split(" ").join("").toLowerCase());
      if (blockedIbans.some((i) => iban.toLowerCase().match(i) != null)) {
        return "validation.iban_blocked";
      }

      return IbanTools.validateIBAN(iban).valid ? true : "validation.iban_invalid";
    });
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
        value: /^\w{3}-\w{3}$/,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Phone() {
    return this.Custom((number: string) => {
      try {
        if (number) {
          const util = PhoneNumberUtil.getInstance();

          if (!number.match(/^\+\d{5}/)) return "validation.code_and_number";
          if (!util.isValidNumber(util.parseAndKeepRawInput(number))) return "validation.pattern_invalid";
        }

        return true;
      } catch {
        return "validation.pattern_invalid";
      }
    });
  }

  public get Address() {
    return {
      pattern: {
        value: Environment.addressFormat,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Signature() {
    return {
      pattern: {
        value: Environment.signatureFormat,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public Custom = (validator: (value: any) => true | string) => ({
    validate: (val: any) => (typeof validator(val) == "boolean" ? validator(val) : i18n.t(validator(val) as string)),
  });
}

const Validations = new ValidationsClass();
export default Validations;
