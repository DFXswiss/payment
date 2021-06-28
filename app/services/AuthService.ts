import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observable, ReplaySubject } from "rxjs";

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
    return AsyncStorage.getItem(SessionKey).then((data) => JSON.parse(data ?? "{}"));
  }

  public updateSession(session: Session): Promise<void> {
    return AsyncStorage.setItem(SessionKey, JSON.stringify(session)).then(() =>
      this.session$.next(session)
    );
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
