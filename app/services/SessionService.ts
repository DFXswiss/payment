import { getUser, postUser } from "./ApiService";
import AuthService, { Credentials } from "./AuthService";
import { deleteValue, getPrimitive, StorageKeys } from "./StorageService";

class SessionServiceClass {
  public register(credentials?: Credentials): Promise<void> {
    return getPrimitive<string>(StorageKeys.Ref)
      .then((ref) =>
        postUser({
          address: credentials?.address ?? "",
          signature: credentials?.signature ?? "",
          walletId: credentials?.walletId ?? 0,
          usedRef: ref,
        })
      )
      .then(() => deleteValue(StorageKeys.Ref))
      .then(() => this.updateSession(true, credentials));
  }

  public login(credentials: Credentials): Promise<void> {
    return getUser(credentials)
      .catch((error) => {
        return this.updateSession(false, credentials).then(() => {
          throw error;
        });
      })
      .then(() => this.updateSession(true, credentials));
  }

  public logout(): Promise<void> {
    return AuthService.updateSession({ address: undefined, signature: undefined, walletId: undefined, isLoggedIn: false });
  }

  private updateSession(isLoggedIn: boolean, credentials?: Credentials): Promise<void> {
    return AuthService.updateSession({ ...credentials, isLoggedIn: isLoggedIn });
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
