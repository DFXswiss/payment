import { ApiError } from "../models/ApiDto";
import { getUser, putUserLanguage, signIn, signUp } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
import SettingsService from "./SettingsService";
import StorageService from "./StorageService";

class SessionServiceClass {
  public register(): Promise<void> {
    return Promise.all([
      StorageService.getValue<Credentials>(StorageService.Keys.Credentials),
      StorageService.getPrimitive<string>(StorageService.Keys.Ref),
    ])
      .then(([credentials, ref]) =>
        signUp({
          address: credentials?.address ?? "",
          signature: credentials?.signature ?? "",
          walletId: credentials?.walletId ?? 0,
          usedRef: ref ?? "",
        })
      )
      .then(this.updateSession)
      .then(() =>
        Promise.all([
          StorageService.deleteValue(StorageService.Keys.Credentials),
          StorageService.deleteValue(StorageService.Keys.Ref),
        ])
      )
      .then(() => SettingsService.Language)
      .then((lang) => lang ? putUserLanguage(lang) : Promise.resolve())
      .then();
  }

  public login(credentials: Credentials): Promise<void> {
    return AuthService.deleteSession()
      .then(() => signIn(credentials))
      .then(this.updateSession)
      .then(getUser)
      .then((user) => user.language ? SettingsService.updateSettings({language: user.language.symbol}) : undefined);
  }

  public logout(): Promise<void> {
    return AuthService.deleteSession();
  }

  private updateSession(accessToken?: string): Promise<void> {
    return AuthService.updateSession({ accessToken: accessToken });
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
