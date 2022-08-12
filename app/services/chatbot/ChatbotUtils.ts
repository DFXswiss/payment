import {
  ChatbotAPIAnswer,
  ChatbotElement,
  ChatbotLanguageValues,
  ChatbotAPIQuestion,
  ChatbotAPIItem,
  ChatbotAPIItemType,
  ChatbotList,
  ChatbotAnswerData,
  ChatbotPage,
  ChatbotAnswer,
  ChatbotQuestion,
  ChatbotAPIState,
  ChatbotAPIItemKind,
  ChatbotAPIConfirmations,
} from "../../models/ChatbotData";
import { createAutoAnswer, shouldAutoAnswer } from "./ChatbotAutoAnswer";
import { createStaticPage, shouldExchangeWithStaticPage } from "./ChatbotStaticPage";

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, "g"), replace);
}

export const chatbotStart = (): ChatbotAPIAnswer => {
  return { items: [], attributes: null };
};

export const chatbotFillAnswerWithData = (apiQuestion: ChatbotAPIQuestion, answer: ChatbotAnswer) => {
  let apiItems = apiQuestion.items as ChatbotAPIItem[];
  // if there are no items to parse just return no pages
  if (apiItems === undefined || apiItems === null || apiItems.length === 0) {
    return;
  }
  // filter for answers
  apiItems = apiItems.filter((item) => item.type.startsWith("query:answer"));
  const lastAnswer = apiItems.splice(-1)[0];
  if (lastAnswer !== undefined) {
    restoreAnswerValues(lastAnswer, answer);
  }
};

export const chatbotFeedQuestion = (
  apiQuestion: ChatbotAPIQuestion,
  previousPages?: ChatbotPage[],
  language?: string
): [ChatbotPage[], boolean, string?, ChatbotAnswer?] => {
  const items: ChatbotQuestion[] = [];
  let confirmations: ChatbotAPIConfirmations | undefined;
  // check if confirmations is already attached to conversation partner attributes
  // this information will be used to decide to exchange with a static page
  if (apiQuestion.attributes !== undefined) {
    const conversationPartner = JSON.parse(apiQuestion.attributes["conversationPartner"]);
    if (conversationPartner !== undefined) {
      confirmations = conversationPartner["confirmations"];
    }
  }
  let apiItems = apiQuestion.items as ChatbotAPIItem[];
  // if there are no items to parse just return no pages
  if (apiItems === undefined || apiItems === null || apiItems.length === 0) {
    return [[], false];
  }
  // remove all answers
  apiItems = apiItems.filter((item) => !item.type.startsWith("query:answer"));
  // parse each item left as question
  apiItems.forEach((item) => {
    items.push(parseQuestion(item, items.length));
  });
  // check chat state if we should finish
  const shouldFinish = apiQuestion.chatState === ChatbotAPIState.FINISH;
  let question: ChatbotQuestion | undefined;
  // if we aren't able to finish, pop last item and save it as question, this will be needed later on
  if (!shouldFinish) {
    question = items.pop();
  }
  // check chat state if help got returned
  if (apiQuestion.chatState === ChatbotAPIState.HELP) {
    // return empty pages, but localized text as string
    return [[], false, chatbotLocalize(question?.label, language)];
  }
  // create an answer based on last question
  const answer = answerBasedOn(apiItems.slice(-1)[0], language, question);
  // we need to know now, how many and which pages already got created on previous feeds and
  // on the concurrent one to decide, if we would need to exchange a page for a static one
  const pages: ChatbotPage[] = previousPages ?? [];
  // each question should represent a single page
  if (items.length > 0) {
    pages.push(createPage(previousPages, confirmations, items[0], items.slice(1)));
  }
  // if we aren't able to finish, check if we have a multiline header
  if (!shouldFinish) {
    pages.push(createPage(previousPages, confirmations, question, undefined, answer));
  }
  const autoAnswer = shouldAutoAnswer(pages);
  if (autoAnswer !== undefined) {
    const lastPage = pages.splice(-1)[0];
    return [pages, shouldFinish, undefined, createAutoAnswer(autoAnswer, lastPage.answer)];
  }
  return [pages, shouldFinish];
};

export const chatbotRestorePages = (
  apiQuestion: ChatbotAPIQuestion,
  previousPages?: ChatbotPage[],
  language?: string
): ChatbotPage[] => {
  const apiItems = apiQuestion.items as ChatbotAPIItem[];
  let pages: ChatbotPage[] = [];
  let itemsToFeed: ChatbotAPIItem[] = [];
  apiItems.forEach((item) => {
    if (item.sequence === 0 && itemsToFeed.length > 0) {
      pages = restorePages(itemsToFeed, previousPages, item, language);
      itemsToFeed = [];
    } else {
      itemsToFeed.push(item);
    }
  });
  // check if items to feed is empty, if not there is still a page to be restored
  if (itemsToFeed.length > 0) {
    pages = restorePages(itemsToFeed, previousPages, undefined, language);
  }
  return pages;
};

export const chatbotUpdateAnswer = (value: string, answer?: ChatbotAnswer) => {
  if (answer !== undefined) {
    answer.value = value;
    answer.hasChanged = true;
  }
};

export const chatbotShouldSendAnswer = (answer: ChatbotAnswer): boolean => {
  // directly return if there is no change done by the user
  if (!answer.hasChanged) {
    return false;
  }
  let value = answer.value;
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  let previousSentValue = answer.previousSentValue;
  if (typeof previousSentValue === "object") {
    previousSentValue = JSON.stringify(previousSentValue);
  }
  return value.length > 0 && value !== previousSentValue;
};

export const chatbotIsEdit = (answer: ChatbotAnswer): boolean => {
  return answer.previousSentValue.length > 0 && answer.timestamp > 0;
};

export const chatbotCreateAnswer = (value: string, answer: ChatbotAnswer): ChatbotAPIAnswer => {
  if (answer.apiType === undefined) {
    return { items: [], attributes: null };
  }

  const answerItem = {
    type: answer.apiType,
    data: JSON.stringify(value),
  };
  return { items: [answerItem], attributes: null };
};

export const chatbotLocalize = (values?: ChatbotLanguageValues, language?: string, answer?: ChatbotAnswer): string => {
  if (values === undefined) {
    return "";
  }
  if (language === undefined) {
    language = "en";
  }
  let localizedValue = values[language.toLowerCase()] ?? values["en"];
  if (answer !== undefined && answer.element === ChatbotElement.DATE) {
    const [isDate, dateFormat] = findDateFormat(localizedValue);
    if (isDate && dateFormat !== undefined) {
      answer.dateFormat = dateFormat;
      localizedValue = localizedValue.replace(dateFormat, "").replace("(", "").replace(")", "").trim();
    }
  }
  // this is intended not a normal whitespace
  return localizedValue?.replace("&nbsp;", " ");
};

/// Parses each item and generates data and assign label
const parseQuestion = (item: ChatbotAPIItem, index: number): ChatbotQuestion => {
  let values: ChatbotLanguageValues = {};
  switch (item.type) {
    case ChatbotAPIItemType.HELP:
    case ChatbotAPIItemType.OUTPUT:
    case ChatbotAPIItemType.PLAIN:
      values = JSON.parse(item.data) as ChatbotLanguageValues;
      break;
    case ChatbotAPIItemType.DROPDOWN:
    case ChatbotAPIItemType.SELECTION:
      const dropdownData = JSON.parse(item.data) as ChatbotList;
      values = dropdownData.text;
      break;
  }
  return {
    key: index,
    label: values,
  };
};

/// Actually creates the answer element which is shown based on given item
const answerBasedOn = (item: ChatbotAPIItem, language?: string, question?: ChatbotQuestion): ChatbotAnswer => {
  const data: ChatbotAnswerData[] = [];
  let dateFormat;
  let apiType;
  let element = ChatbotElement.TEXT;
  switch (item.type) {
    case ChatbotAPIItemType.PLAIN:
      apiType = ChatbotAPIItemType.ANSWER_PLAIN;
      element = ChatbotElement.TEXTBOX;
      // chatbotLocalize does also call findDateFormat, but only if answers' element is DATE
      // means on first chatbotLocalize it will no try to search for a date,
      // but afterwards on language changes it needs to re-parse the question and try to find
      // a new date format.
      // YES date formats shouldn't be localized, but sadly they are
      const [isDate, foundDateFormat] = findDateFormat(chatbotLocalize(question?.label, language));
      if (isDate && question !== undefined && foundDateFormat !== undefined) {
        element = ChatbotElement.DATE;
        dateFormat = foundDateFormat;
      }
      break;
    case ChatbotAPIItemType.DROPDOWN:
    case ChatbotAPIItemType.SELECTION:
      apiType = ChatbotAPIItemType.ANSWER_SELECTION;
      element = ChatbotElement.LIST;
      const dropdownData = JSON.parse(item.data) as ChatbotList;
      data.push(
        ...dropdownData.selection.map((item) => {
          delete item.prefix;
          return {
            key: item.key,
            label: item.text,
            isSelected: false,
            apiElement: item,
          };
        })
      );
      break;
  }
  return {
    apiType: apiType ?? ChatbotAPIItemType.PLAIN,
    element: element,
    data: data,
    dateFormat: dateFormat,
    value: "",
    previousSentValue: "",
    timestamp: 0,
    hasChanged: false,
  };
};

const findDateFormat = (label?: string): [boolean, string?] => {
  if (label === undefined) {
    return [false, undefined];
  }
  let result = false;
  let dateFormat;
  const start = label?.indexOf("(");
  const end = label?.indexOf(")");
  // (DD.MM.YYYY) gap between index of ( and ) is 11
  if (end - start === 11) {
    dateFormat = label?.substring(start + 1, end);
    result = true;
  }
  return [result, dateFormat];
};

const languageValuesSplit = (languageValues: ChatbotLanguageValues, split: string): ChatbotLanguageValues[] => {
  let newValue: ChatbotLanguageValues[] = [];
  for (const key in languageValues) {
    const values = replaceAll(languageValues[key], "<br>", split)
      .split(split)
      .filter((value) => value.length > 0);
    if (newValue.length === 0) {
      newValue = values.map((value) => {
        let object: ChatbotLanguageValues = {};
        object[key] = value;
        return object;
      });
    } else {
      for (const [index, item] of values.entries()) {
        if (index < newValue.length) {
          newValue[index][key] = item;
        }
      }
    }
  }
  return newValue;
};

const languageValuesJoin = (languageValues: ChatbotLanguageValues[], join: string): ChatbotLanguageValues => {
  const newValue: ChatbotLanguageValues = {};
  languageValues.forEach((languageValue) => {
    for (let key in languageValue) {
      const value = languageValue[key];
      const currentValue = newValue[key];
      newValue[key] = currentValue === undefined ? value : currentValue + join + value;
    }
  });
  return newValue;
};

const createPage = (
  previousPages?: ChatbotPage[],
  confirmations?: ChatbotAPIConfirmations,
  header?: ChatbotQuestion,
  multipleBodies?: ChatbotQuestion[],
  answer?: ChatbotAnswer
): ChatbotPage => {
  const staticPage = shouldExchangeWithStaticPage(previousPages, confirmations, answer);
  if (staticPage !== undefined) {
    return createStaticPage(staticPage, answer);
  }
  if (header?.label !== undefined && needsSplit(header.label)) {
    const multilineHeader = languageValuesSplit(header.label, "\n");
    if (multilineHeader !== undefined && multilineHeader.length > 1) {
      return {
        header: multilineHeader[0],
        body: languageValuesJoin(multilineHeader.slice(1), "\n"),
        bodyHasSupportLink: false,
        answer: answer,
      };
    }
  }
  return {
    header: header?.label,
    body:
      multipleBodies !== undefined
        ? languageValuesJoin(
            multipleBodies.map((question) => question.label),
            "\n"
          )
        : undefined,
    bodyHasSupportLink: false,
    answer: answer,
  };
};

const restorePages = (
  items: ChatbotAPIItem[],
  previousPages?: ChatbotPage[],
  item?: ChatbotAPIItem,
  language?: string
): ChatbotPage[] => {
  const question = { items: items, chatState: "TEXT" };
  const [newPages, isFinished, help, autoAnswer] = chatbotFeedQuestion(question, previousPages, language);
  if (item !== undefined && item.kind === ChatbotAPIItemKind.INPUT && autoAnswer === undefined) {
    const lastPage = newPages[newPages.length - 1];
    restoreAnswerValues(item, lastPage.answer);
  }
  return newPages;
};

const restoreAnswerValues = (item: ChatbotAPIItem, answer?: ChatbotAnswer) => {
  if (answer === undefined) {
    return;
  }
  // Krysh: there are two different types of answers
  // 1) only strings, should be parse to correctly display
  // 2) objects, should not get parsed
  const parsedData = JSON.parse(item.data);
  if (typeof parsedData === "string") {
    answer.previousSentValue = parsedData;
  } else {
    answer.previousSentValue = item.data;
  }
  answer.timestamp = item.time;
  answer.hasChanged = false;
};

const needsSplit = (values: ChatbotLanguageValues): boolean => {
  // get first property of values, as only language values are stored.
  // it doesn't matter which language is accessed
  const value = values[Object.keys(values)[0]];
  return value !== undefined ? value.indexOf("\n") > 0 || value.indexOf("<br>") > 0 : false;
};
