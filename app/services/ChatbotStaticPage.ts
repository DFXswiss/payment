import { ChatbotAnswer, ChatbotAPIConfirmations, ChatbotLanguageValues, ChatbotPage } from "../models/ChatbotData";

export enum ChatbotStaticPage {
  START,
  ALL_ANSWERS_CORRECT,
  INFORM_OF_CHANGE_CONFIRMATION,
}

export const shouldExchangeWithStaticPage = (pages?: ChatbotPage[], confirmations?: ChatbotAPIConfirmations, answer?: ChatbotAnswer): ChatbotStaticPage|undefined => {
  if (pages === undefined || pages.length === 0) {
    return ChatbotStaticPage.START
  } else if (hasOnlyOneAnswerPossibility(answer) && confirmations?.confirmsForm === "NO" && confirmations?.informsOfChanges === "NO") {
    return ChatbotStaticPage.ALL_ANSWERS_CORRECT
  } else if (hasOnlyOneAnswerPossibility(answer) && confirmations?.confirmsForm === "YES" && confirmations?.informsOfChanges === "NO") {
    return ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION
  }
  return undefined
}

export const createStaticPage = (page: ChatbotStaticPage, answer?: ChatbotAnswer): ChatbotPage => {
  return {
    header: createStaticHeader(page),
    body: createStaticBody(page),
    bodyHasSupportLink: page === ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION,
    answer: exchangeLanguageValues(page, answer),
  }
}

const createStaticHeader = (page: ChatbotStaticPage): ChatbotLanguageValues|undefined => {
  switch (page) {
    case ChatbotStaticPage.START:
      return {
        "en": "Welcome, I am your chatbot and together we will verify you for using DFX.",
        "de": "Herzlich willkommen, ich bin dein Chatbot und zusammen verifizieren wir dich für die Nutzung bei DFX.",
        "fr": "Bienvenue, je suis votre chatbot et ensemble, nous allons vérifier votre compte pour DFX.",
      }
    case ChatbotStaticPage.ALL_ANSWERS_CORRECT:
      return {
        "en": "Thank you for your information. Please confirm that your provided information are true.",
        "de": "Vielen Dank für deine Angaben. Bitte bestätige, dass alle Angaben der Wahrheit entsprechen.",
        "fr": "Merci pour ces informations. Veuillez confirmer que les informations fournies sont vraies et correctes.",
      }
    case ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION:
      return {
        "en": "Please confirm that you commit to inform DFX im case of any changes with regard to the given information.",
        "de": "Bitte bestätige, dass du dich dazu verpflichtest, DFX über alle Änderungen der hier gemachten Angaben zu informieren.",
        "fr": "Veuillez confirmer que vous vous engagez à avertir DFX de tout changement relatif à ces informations.",
      }
    default:
      return undefined
  }
}

const createStaticBody = (page: ChatbotStaticPage): ChatbotLanguageValues|undefined => {
  switch (page) {
    case ChatbotStaticPage.START:
      return {
        "en": "To be able to verify you, I need further information in order to comply with Anti-Money Laundering (AML) and other regulations.",
        "de": "Um dich verifizieren zu können, benötige ich weitere Informationen um dem Geldwäschegesetz (GwG) und anderen Vorschriften zu entsprechen.",
        "fr": "Afin de pouoir vous vérifier, j'ai besoin d'informations complémentaires pour être en règle avec la politique anti-blanchiment (ABA) et autres régulations."
      }
    case ChatbotStaticPage.ALL_ANSWERS_CORRECT:
      return {
        "en": "It is a criminal offense to deliberately provide false information in this form (article 251 of the Swiss Criminal Code, document forgery).",
        "de": "Es ist strafbar, vorsätzlich falsche Angaben in diesem Formular zu machen (Artikel 251 des Schweizer Strafgesetzbuches, Urkundenfälschung).",
        "fr": "Fournir délibérément de fausses informations dans ce formulaire est une infraction pénale au sens de l'article 251 du Code Pénal Suisse sur la falsification des documents.",
      }
    case ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION:
      return {
        "en": "Communicate any changes right away via email:",
        "de": "Kommuniziere etwaige Änderungen direkt per Email:",
        "fr": "Communiquez tout changement immédiatement par e-mail :",
      }
    default:
      return undefined
  }
}

const exchangeLanguageValues = (page: ChatbotStaticPage, answer?: ChatbotAnswer): ChatbotAnswer|undefined => {
  if (answer === undefined) {
    return answer
  }
  let changedValues: ChatbotLanguageValues|undefined = undefined
  switch (page) {
    case ChatbotStaticPage.ALL_ANSWERS_CORRECT:
      changedValues = {
        "en": "All answers are correct.",
        "de": "Alle Antworten sind richtig.",
        "fr": "Toutes les réponses sont correctes.",
      }
  }
  if (changedValues !== undefined && answer.data.length > 0) {
    answer.data[0].label = changedValues
  }
  return answer
}

const hasOnlyOneAnswerPossibility = (answer?: ChatbotAnswer): boolean => {
  if (answer === undefined) {
    return false
  }
  return answer.data.length === 1
}