import AsyncStorage from "@react-native-async-storage/async-storage";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";

// TODO: remove dummy data
const Address = "8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG";
const Signature = "Hwj3sJjBxMOnkPxZkGtqinGdASIOM6ffGDCcQsWA7kRIIjMP5/HMyuZwlLnBKuD6weD5c/8HIzMrmi6GpCmFU04=";

const SessionKey = "session";

interface ISession {
  address?: string;
  signature?: string;
}

export class Session implements ISession {
  public address?: string;
  public signature?: string;

  public get isLoggedIn(): boolean {
    return !!this.address;
  }

  public static create(session: ISession): Session {
    return Object.assign(new Session(), session);
  }
}

class SessionServiceClass {
  private session$ = new ReplaySubject<Session>();

  constructor() {
    this.Session.then((session) => this.session$.next(session));
  }

  public get Session$(): Observable<Session> {
    return this.session$;
  }

  public get Session(): Promise<Session> {
    return AsyncStorage.getItem(SessionKey).then((data) => Session.create(JSON.parse(data ?? "{}")));
  }

  // TODO: login with API
  public login(): Promise<void> {
    return this.updateSession({ address: Address, signature: Signature });
  }

  public logout(): Promise<void> {
    return this.updateSession({ address: undefined, signature: undefined });
  }

  private updateSession(session: ISession): Promise<void> {
    this.session$.next(Session.create(session));
    return AsyncStorage.setItem(SessionKey, JSON.stringify(session));
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
