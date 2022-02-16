import { getUser, putUserLanguage, signIn, signUp } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
import SettingsService from "./SettingsService";

const DefaultWalletId = 2;

class SessionServiceClass {
  public register(credentials: Credentials, ref?: string, walletId?: number): Promise<void> {
    return signUp({
      address: credentials?.address ?? "",
      signature: credentials?.signature ?? "",
      walletId: walletId ?? DefaultWalletId,
      usedRef: ref,
    })
      .then(this.updateSession)
      .then(this.updateUserLanguage)
      .then();
  }

  public login(credentials: Credentials): Promise<void> {
    return AuthService.deleteSession()
      .then(() => signIn(credentials))
      .then(this.updateSession)
      .then(() => SettingsService.Settings)
      .then((s) => (s.isIframe ? this.updateUserLanguage() : this.updateLanguageSetting()));
  }

  public logout(): Promise<void> {
    return AuthService.deleteSession();
  }

  private updateSession(accessToken?: string): Promise<void> {
    return AuthService.updateSession({ accessToken: accessToken });
  }

  private updateLanguageSetting(): Promise<void> {
    return getUser().then((u) =>
      u.language ? SettingsService.updateSettings({ language: u.language.symbol }) : undefined
    );
  }

  private updateUserLanguage(): Promise<void> {
    return SettingsService.Language.then((lang) => (lang ? putUserLanguage(lang) : Promise.resolve()));
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
