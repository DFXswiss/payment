import { ChatbotAnswer, ChatbotAuthenticationInfo, ChatbotQuestion } from "../models/ChatbotData"
import { sleep } from "../utils/Utils"

const BaseUrl = "https://services.eurospider.com/chatbot-service/rest/session"
const Status = "status"
const AuthenticationInfo = "authentication-info"
const Challenge = "challenge"
const Authenticate = "authenticate"
const NextStep = "next-step"

// TODO: remove mocks
const shouldMock = true
let sentQuestion7 = false
let sentQuestion9 = false
let sentQuestion10 = false
let sentQuestion11 = false
let sentQuestion12 = false
let sentQuestion13 = false

export const getStatus = (id: string): Promise<void> => {
  return fetchFrom(id, Status, "GET")
}

export const getAuthenticationInfo = (id: string): Promise<ChatbotAuthenticationInfo> => {
  return fetchFrom(id, AuthenticationInfo, "GET")
}

export const requestSMSCode = (id: string): Promise<boolean> => {
  console.log(`requestSMSCode: ${id}`)
  if (shouldMock) {
    return new Promise<boolean>(resolve => { resolve(true) })
  }
  return fetchFrom(id, Challenge, "GET")
}

export const postSMSCode = (id: string): Promise<string> => {
  console.log(`postSMSCode: ${id}`)
  if (shouldMock) {
    return new Promise<string>(resolve => { 
      sleep(1).then(() => resolve("10laBhOhGM8Yx2EcKmINKndyMW5DPa5pnaFIlmtYZQTj2LlRvnSxHvLvfNiMB4uY"))
    })
  }
  return fetchFrom(id, Authenticate, "POST")
}

export const nextStep = (id: string, chatbotId: string, answer: ChatbotAnswer): Promise<ChatbotQuestion> => {
  console.log(`nextStep\nid: ${id}\nchatbotId: ${chatbotId}\nanswer:\n`)
  console.log(answer)
  if (shouldMock) {
    return new Promise<ChatbotQuestion>(resolve => { 
      sleep(1).then(() => resolve(chatbotNextQuestionBaseOn(answer)))
    })
  }
  return fetchFrom(id, NextStep, "POST", `sak=${chatbotId}`)
}

// Mock import data need to be removed
// Mock starts here
import initialQuestion from "./mocks/next-step_1.json"
import question2 from "./mocks/next-step_2.json"
import question3 from "./mocks/next-step_3a.json"
import question4 from "./mocks/next-step_4.json"
import question5 from "./mocks/next-step_5.json"
import question6 from "./mocks/next-step_6.json"
import question7 from "./mocks/next-step_7.json"
import question8 from "./mocks/next-step_8.json"
import question9 from "./mocks/next-step_9.json"
import question10 from "./mocks/next-step_10.json"
import question11 from "./mocks/next-step_11.json"
import question12 from "./mocks/next-step_12.json"
import question13 from "./mocks/next-step_13.json"
import question14 from "./mocks/next-step_14.json"
import question15 from "./mocks/next-step_15.json"
import question16 from "./mocks/next-step_16.json"
import question17 from "./mocks/next-step_17.json"
import question18 from "./mocks/next-step_18.json"
import question19 from "./mocks/next-step_19.json"
import question20 from "./mocks/next-step_20.json"
import question21 from "./mocks/next-step_21.json"
import question22 from "./mocks/next-step_22.json"

const chatbotInit = "{\"items\":[],\"attributes\":null}"
const chatbotAnswer1 = "{\"items\":[{\"type\":\"query:answer:plain\",\"data\":\"\\\"01.01.1980\\\"\"}],\"attributes\":null}"
const chatbotAnswer2 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"AF\\\",\\\"text\\\":{\\\"de\\\":\\\"Afghanistan\\\",\\\"en\\\":\\\"Afghanistan\\\",\\\"fr\\\":\\\"Afghanistan\\\",\\\"it\\\":\\\"Afghanistan\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer3 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"done\\\",\\\"text\\\":{\\\"en\\\":\\\"No further citizenship\\\",\\\"de\\\":\\\"Keine weitere Staatsbürgerschaft\\\",\\\"fr\\\":\\\"Pas d'autre nationalité\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer4 = "{\"items\":[{\"type\":\"query:answer:plain\",\"data\":\"\\\"Berlin\\\"\"}],\"attributes\":null}"
const chatbotAnswer5 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"DE\\\",\\\"text\\\":{\\\"de\\\":\\\"Deutschland\\\",\\\"en\\\":\\\"Germany\\\",\\\"fr\\\":\\\"Allemagne\\\",\\\"it\\\":\\\"Germania\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer6 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"FROM_30001_TO_100000\\\",\\\"text\\\":{\\\"en\\\":\\\"CHF 30,001 to 100,000\\\",\\\"de\\\":\\\"CHF 30'001 bis 100'000\\\",\\\"fr\\\":\\\"de CHF 30.001 à 100.000\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer7 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"SAVINGS\\\",\\\"text\\\":{\\\"en\\\":\\\"Savings\\\",\\\"de\\\":\\\"Erspartes\\\",\\\"fr\\\":\\\"Épargne\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer8 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer9 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer10 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer11 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer12 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer13 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"EMPLOYEE\\\",\\\"text\\\":{\\\"en\\\":\\\"Employee\\\",\\\"de\\\":\\\"Mitarbeiter\\\",\\\"fr\\\":\\\"Collaborateur\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer14 = "{\"items\":[{\"type\":\"query:answer:plain\",\"data\":\"\\\"ABC\\\"\"}],\"attributes\":null}"
const chatbotAnswer15 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"OTHER\\\",\\\"text\\\":{\\\"en\\\":\\\"Other\\\",\\\"de\\\":\\\"Andere\\\",\\\"fr\\\":\\\"Autre\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer16 = "{\"items\":[{\"type\":\"query:answer:plain\",\"data\":\"\\\"Testing\\\"\"}],\"attributes\":null}"
const chatbotAnswer17 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"NO\\\",\\\"text\\\":{\\\"en\\\":\\\"No\\\",\\\"de\\\":\\\"Nein\\\",\\\"fr\\\":\\\"Non\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer18 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"FROM_30001_TO_100000\\\",\\\"text\\\":{\\\"en\\\":\\\"CHF 30,001 to 100,000\\\",\\\"de\\\":\\\"CHF 30'001 bis 100'000\\\",\\\"fr\\\":\\\"de CHF 30.001 à 100.000\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer19 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"FROM_10001_TO_30000\\\",\\\"text\\\":{\\\"en\\\":\\\"CHF 10,001 to 30,000\\\",\\\"de\\\":\\\"CHF 10'001 bis 30'000\\\",\\\"fr\\\":\\\"de CHF 10.001 à 30.000\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer20 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"YES\\\",\\\"text\\\":{\\\"en\\\":\\\"All answers are correct.\\\",\\\"de\\\":\\\"Alle Angaben sind korrekt.\\\",\\\"fr\\\":\\\"Toutes les indications sont correctes.\\\"}}\"}],\"attributes\":null}"
const chatbotAnswer21 = "{\"items\":[{\"type\":\"query:answer:selection\",\"data\":\"{\\\"key\\\":\\\"YES\\\",\\\"text\\\":{\\\"en\\\":\\\"I confirm.\\\",\\\"de\\\":\\\"Ich bestätige.\\\",\\\"fr\\\":\\\"Je confirme.\\\"}}\"}],\"attributes\":null}"

const chatbotNextQuestionBaseOn = (answer: ChatbotAnswer): ChatbotQuestion => {
  console.log(JSON.stringify(answer))
  if (JSON.stringify(answer) === chatbotInit) return initialQuestion
  if (JSON.stringify(answer) === chatbotAnswer1) return question2
  if (JSON.stringify(answer) === chatbotAnswer2) return question3
  if (JSON.stringify(answer) === chatbotAnswer3) return question4
  if (JSON.stringify(answer) === chatbotAnswer4) return question5
  if (JSON.stringify(answer) === chatbotAnswer5) return question6
  if (JSON.stringify(answer) === chatbotAnswer6 && !sentQuestion7) {
    sentQuestion7 = true
    return question7
  }
  if (JSON.stringify(answer) === chatbotAnswer7) return question8
  if (JSON.stringify(answer) === chatbotAnswer8 && !sentQuestion9) {
    sentQuestion9 = true
    return question9
  }
  if (JSON.stringify(answer) === chatbotAnswer9 && !sentQuestion10) {
    sentQuestion10 = true
    return question10
  }
  if (JSON.stringify(answer) === chatbotAnswer10 && !sentQuestion11) {
    sentQuestion11 = true
    return question11
  }
  if (JSON.stringify(answer) === chatbotAnswer11 && !sentQuestion12) {
    sentQuestion12 = true
    return question12
  }
  if (JSON.stringify(answer) === chatbotAnswer12 && !sentQuestion13) {
    sentQuestion13 = true
    return question13
  }
  if (JSON.stringify(answer) === chatbotAnswer13) return question14
  if (JSON.stringify(answer) === chatbotAnswer14) return question15
  if (JSON.stringify(answer) === chatbotAnswer15) return question16
  if (JSON.stringify(answer) === chatbotAnswer16) return question17
  if (JSON.stringify(answer) === chatbotAnswer17) return question18
  if (JSON.stringify(answer) === chatbotAnswer18) return question19
  if (JSON.stringify(answer) === chatbotAnswer19) return question20
  if (JSON.stringify(answer) === chatbotAnswer20) return question21
  if (JSON.stringify(answer) === chatbotAnswer21) return question22
  console.warn("MOCK: not finding next question to answer above")
  return {}
}
// Mock ends here

const fetchFrom = <T>(
  id: string,
  command: string,
  method: "GET" | "POST",
  parameters?: string,
  data?: any,
): Promise<T> => {
  return (
    fetch(buildUrl(id, command, parameters), {
      method: method,
      body: JSON.stringify(data)
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return response.json().then((body) => {
        throw body;
      });
    })
  );
}

const buildUrl = (id: string, command: string, parameters: string | undefined): string => {
  if (parameters !== undefined) {
    return `${BaseUrl}/${id}/${command}?nc=true&${parameters}`
  }
  return `${BaseUrl}/${id}/${command}?nc=true`
}