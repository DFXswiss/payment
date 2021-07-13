import { Observable, ReplaySubject } from "rxjs";
import { getValue, storeValue } from "./StorageService";

const SessionKey = "session";

export interface Credentials {
  address?: string;
  signature?: string;
  walletId?: number;
}

export interface Session extends Credentials {
  isLoggedIn: boolean;
}

class AuthServiceClass {
  private session$ = new ReplaySubject<Session>();

  constructor() {
    this.Session.then((session) => this.session$.next(session));
  }

  public get Session$(): Observable<Session> {
    return this.session$;
  }

  public get Session(): Promise<Session> {
    return getValue(SessionKey);
  }

  public updateSession(session: Session): Promise<void> {
    return storeValue(SessionKey, session).then(() => this.session$.next(session));
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
