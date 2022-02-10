import i18n from "../i18n/i18n";
import { SetStateAction } from "react";
import { Linking, Platform } from "react-native";
import NotificationService from "../services/NotificationService";
import { DocumentPickerOptions } from "expo-document-picker";
import * as DocumentPicker from "expo-document-picker";

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

export const openUrl = (url: string): void => {
  if (Platform.OS == "web") {
    const newWindow = window.open(url, "_blank");

    const popUpBlocked = newWindow == null || newWindow.closed || typeof newWindow.closed == "undefined";
    if (popUpBlocked) NotificationService.error(i18n.t("feedback.pop_up_blocked"));
  } else {
    Linking.openURL(url);
  }
};

export const sleep = (seconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const pickDocuments = (options: DocumentPickerOptions): Promise<File[]> => {
  return DocumentPicker.getDocumentAsync(options).then((result) => {
    if (result.type === "success") {
      return [...Array(result.output?.length).keys()]
        .map((i) => result.output?.item(i))
        .filter((f) => f != null)
        .map((f) => f as File);
    }

    throw new Error();
  });
};

export const toBase64 = (file: File): Promise<string | undefined> => {
  return new Promise<string | undefined>((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result ? (reader.result as string) : undefined);
    reader.onerror = (e) => reject(e);
  });
};