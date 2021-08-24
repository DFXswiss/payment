import { SetStateAction } from "react";
import * as XmlParser from "fast-xml-parser";
import { Payment } from "../models/Payment";

export const updateObject = (obj?: any, update?: any) => (obj ? { ...obj, ...update } : undefined);
export const join = (array: any[], separator: string = ", ") => array.reduce((prev, curr) => (curr ? (prev ? prev + separator + curr : curr) : prev), "");
export const resolve = <T>(update: SetStateAction<T>, value: T): T => update instanceof Function ? update(value) : update;

// TODO: type annotations (also for users)
export const createRules = (rules: any): any => {
  for (const property in rules) {
    if (rules[property] instanceof Array) {
      rules[property] = rules[property].reduce((prev: any, curr: any) => updateObject(prev, curr), {});
    }
  }
  return rules;
};

export const readAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (event) => reject(event);
    reader.readAsText(file);
  });
};

export const parseSepaXml = (xmlFile: string): Payment[] => {
  const validationResult = XmlParser.validate(xmlFile);
  if (validationResult !== true) {
    throw validationResult;
  }

  const xml = XmlParser.parse(xmlFile, { ignoreAttributes: false });
  const payments: any[] = xml.Document.BkToCstmrStmt.Stmt.Ntry;

  return payments
    .map((payment: any) => [payment, payment.NtryDtls.TxDtls])
    .map(([payment, details]) => ({
        iban: details.RltdPties.DbtrAcct.Id.IBAN,
        amount: details.Amt["#text"],
        currency: details.Amt['@_Ccy'],
        userName: details.RltdPties.Dbtr.Nm,
        userAddress: details.RltdPties.Dbtr.PstlAdr.AdrLine,
        userCountry: details.RltdPties.Dbtr.PstlAdr.Ctry,
        bankUsage: details.RmtInf.Ustrd,
        received: payment.ValDt.Dt,
        bankTransactionId: payment.AcctSvcrRef,
    }));
};