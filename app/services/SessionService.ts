import { ApiError } from "../models/ApiDto";
import { signIn, signUp } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
import StorageService from "./StorageService";

class SessionServiceClass {
  public register(credentials?: Credentials): Promise<void> {
    return StorageService.getPrimitive<string>(StorageService.Keys.Ref)
      .then((ref) =>
        signUp({
          address: credentials?.address ?? "",
          signature: credentials?.signature ?? "",
          walletId: credentials?.walletId ?? 0,
          usedRef: ref,
        })
      )
      // TODO: login for token?
      .then((accessToken) => this.updateSession(credentials, accessToken))
      .then(() => StorageService.deleteValue(StorageService.Keys.Ref));
  }

  public login(credentials: Credentials): Promise<void> {
    return signIn(credentials)
      .catch((error: ApiError) => {
        return this.updateSession(credentials).then(() => {
          throw error;
        });
      })
      .then((accessToken) => this.updateSession(credentials, accessToken));
  }

  public logout(): Promise<void> {
    return AuthService.updateSession({ address: undefined, signature: undefined, walletId: undefined, accessToken: undefined });
  }

  private updateSession(credentials?: Credentials, accessToken?: string): Promise<void> {
    return AuthService.updateSession({ ...credentials, accessToken: accessToken });
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
