import { Observable, ReplaySubject } from "rxjs";
import StorageService from "./StorageService";

const SessionKey = "session";

export interface Credentials {
  address?: string;
  signature?: string;
  walletId?: number;
}

export interface ISession extends Credentials {
  accessToken?: string;
}

export class Session implements ISession {
  public address?: string;
  public signature?: string;
  public walletId?: number;
  public accessToken?: string;

  public get isLoggedIn() {
    return Boolean(this.accessToken)
  }

  public static create(session: ISession): Session {
    return Object.assign(new Session(), session);
  }
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
    return StorageService.getValue<ISession>(SessionKey)
      .then(Session.create);
  }

  public updateSession(session: ISession): Promise<void> {
    return StorageService.storeValue(SessionKey, session).then(() => this.session$.next(Session.create(session)));
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
