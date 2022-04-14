import { ChatbotAuthenticationInfo } from "../models/ChatbotData"

const BaseUrl = "https://services.eurospider.com/chatbot-service/rest/session"
const Status = "status"
const AuthenticationInfo = "authentication-info"
const Challenge = "challenge"

export const getStatus = (id: string): Promise<void> => {
  return fetchFrom(id, Status, "GET")
}

export const getAuthenticationInfo = (id: string): Promise<ChatbotAuthenticationInfo> => {
  return fetchFrom(id, AuthenticationInfo, "GET")
}

export const getChallenge = (id: string): Promise<boolean> => {
  return fetchFrom(id, Challenge, "GET")
}

const fetchFrom = <T>(
  id: string,
  command: string,
  method: "GET" | "POST",
  data?: any,
): Promise<T> => {
  return (
    fetch(buildUrl(id, command), {
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

const buildUrl = (id: string, command: string): string => {
  return `${BaseUrl}/${id}/${command}?nc=true`
}