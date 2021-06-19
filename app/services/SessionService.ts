
import { getUser, postUser } from "./ApiService";
import AuthService, { ICredentials } from "./AuthService";

const WalletId = 1;

class SessionServiceClass {

  public login(credentials: ICredentials): Promise<void> {
    return (
      getUser(credentials)
        .catch(() => postUser({ address: credentials.address ?? "", signature: credentials.signature ?? "", walletId: WalletId }))
        .then(() => AuthService.updateCredentials(credentials))
    );
  }

  public logout(): Promise<void> {
    return AuthService.updateCredentials({ address: undefined, signature: undefined });
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
