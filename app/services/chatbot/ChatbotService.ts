import { ChatbotAPIAnswer, ChatbotAPIQuestion, ChatbotStatus } from "../../models/ChatbotData"

const BaseUrl = "https://services.eurospider.com/chatbot-service/rest/session"
const Status = "status"
const AuthenticationInfo = "authentication-info"
const Challenge = "challenge"
const Authenticate = "authenticate"
const NextStep = "next-step"
const Update = "update"
const Skip = "skip"

export const getStatus = (id?: string, chatbotId?: string): Promise<ChatbotStatus> => {
  if (id === undefined || chatbotId === undefined) {
    return Promise.reject()
  }
  return fetchFrom(id, Status, "GET", "sak=" + chatbotId, undefined, "TEXT")
}

export const getAuthenticationInfo = (id: string): Promise<unknown> => {
  return fetchFrom(id, AuthenticationInfo, "GET")
}

export const requestSMSCode = (id: string): Promise<boolean> => {
  return fetchFrom(id, Challenge, "GET")
}

export const postSMSCode = (id: string, code: string): Promise<string> => {
  return fetchFrom(id, Authenticate, "POST", undefined, code, "TEXT")
}

export const getUpdate = (id?: string, chatbotId?: string): Promise<ChatbotAPIQuestion> => {
  if (id === undefined || chatbotId === undefined) {
    return Promise.reject()
  }
  return fetchFrom(id, Update, "GET", "sak=" + chatbotId, undefined, "JSON")
}

export const requestSkip = (timestamp: number, id?: string, chatbotId?: string): Promise<string> => {
  if (id === undefined || chatbotId === undefined) {
    return Promise.reject()
  }
  return fetchFrom(id, Skip, "POST", "sak=" + chatbotId, timestamp, "JSON", "TEXT")
}

export const nextStep = (id?: string, chatbotId?: string, answer?: ChatbotAPIAnswer): Promise<ChatbotAPIQuestion> => {
  if (id === undefined || chatbotId === undefined || answer === undefined) {
    return Promise.reject()
  }
  return fetchFrom(id, NextStep, "POST", "sak=" + chatbotId, answer, "JSON")
}

const fetchFrom = <T>(
  id: string,
  command: string,
  method: "GET" | "POST",
  parameters?: string,
  data?: any,
  type?: "JSON" | "TEXT",
  overrideReturnType?: "JSON" | "TEXT",
): Promise<T> => {
  return (
    fetch(buildUrl(id, command, parameters), {
      method: method,
      body: type === "JSON" ? JSON.stringify(data) : data,
      headers: {
        'Content-Type': type === "JSON" ? 'application/json;charset=UTF-8' : 'text/plain'
      },
    })
    .then((response) => {
      if (response.ok) {
        if (type === "TEXT" || overrideReturnType === "TEXT") {
          return response.text()
        }
        return response.json()
      }
      return response.json().then((body) => {
        throw body
      })
    })
  )
}

const buildUrl = (id: string, command: string, parameters: string | undefined): string => {
  return `${BaseUrl}/${id}/${command}?nc=true` + (parameters ? `&${parameters}` : '')
}