import { ApiError } from "../models/ApiDto";
import { signIn, signUp } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
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
          usedRef: ref,
        })
      )
      .then((accessToken) => this.updateSession(accessToken))
      .then(() =>
        Promise.all([
          StorageService.deleteValue(StorageService.Keys.Credentials),
          StorageService.deleteValue(StorageService.Keys.Ref),
        ])
      )
      .then();
  }

  public login(credentials: Credentials): Promise<void> {
    return signIn(credentials)
      .catch((error: ApiError) => {
        return StorageService.storeValue(StorageService.Keys.Credentials, credentials).then(() => {
          throw error;
        });
      })
      .then((accessToken) => this.updateSession(accessToken));
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
