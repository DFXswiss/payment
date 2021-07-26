import jwtDecode from "jwt-decode";
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
    return Boolean(this.accessToken);
  }

  public static create(session: ISession): Session {
    return Object.assign(new Session(), session);
  }
}

interface JWT {
  address: string;
  exp: number;
  iat: number;
}

class AuthServiceClass {
  private session$ = new ReplaySubject<Session>();

  constructor() {
    this.Session
      .then((session) => this.session$.next(session))
      .catch((_) => this.session$.next(Session.create({})));
  }

  public get Session$(): Observable<Session> {
    return this.session$;
  }

  public get Session(): Promise<Session> {
    return StorageService.getValue<ISession>(SessionKey)
      .then(Session.create)
      .then((session) => {
        if (this.isTokenExpired(session.accessToken)) {
          this.deleteSession();
          throw new Error("Access token expired!");
        }

        return session;
      });
  }

  public updateSession(session: ISession): Promise<void> {
    return StorageService.storeValue(SessionKey, session).then(() => this.session$.next(Session.create(session)));
  }

  public deleteSession(): Promise<void> {
    return this.updateSession({
      address: undefined,
      signature: undefined,
      walletId: undefined,
      accessToken: undefined,
    });
  }

  private isTokenExpired(accessToken?: string): boolean {
    const token: JWT | undefined = accessToken ? jwtDecode(accessToken) : undefined;
    return token != null && Date.now() > token.exp * 1000;
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
