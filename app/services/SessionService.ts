import { getUser, putUserLanguage, signIn, signUp } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
import SettingsService from "./SettingsService";

const DefaultWalletId = 2;

class SessionServiceClass {
  public register(credentials: Credentials, ref: string | undefined, walletId: number | undefined): Promise<void> {
      return signUp({
        address: credentials?.address ?? "",
        signature: credentials?.signature ?? "",
        walletId: walletId ?? DefaultWalletId,
        usedRef: ref ?? "",
      })
      .then(this.updateSession)
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
