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

const chatbotInit = "{\"items\":[],\"attributes\":null}"
const chatbotAnswer1 = "{\"items\":[{\"type\":\"query:answer:plain\",\"data\":\"01.01.1980\"}],\"attributes\":null}"

const chatbotNextQuestionBaseOn = (answer: ChatbotAnswer): ChatbotQuestion => {
  // console.log("checking against")
  // console.log(JSON.stringify(answer))
  // console.log(chatbotAnswer1)
  if (JSON.stringify(answer) === chatbotInit) return initialQuestion
  if (JSON.stringify(answer) === chatbotAnswer1 ||
    (JSON.stringify(answer).includes("01.01.1980") && JSON.stringify(answer).includes("query:answer:plain"))) return question2
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