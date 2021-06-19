import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observable, ReplaySubject } from "rxjs";

const CredentialsKey = "credentials";


export interface ICredentials {
  address?: string;
  signature?: string;
}

export class Credentials implements ICredentials {
  public address?: string;
  public signature?: string;

  public get isLoggedIn(): boolean {
    return !!this.address;
  }

  public static create(credentials: ICredentials): Credentials {
    return Object.assign(new Credentials(), credentials);
  }
}

class AuthServiceClass {
  private credentials$ = new ReplaySubject<Credentials>();

  constructor() {
    this.Credentials.then((credentials) => this.credentials$.next(credentials));
  }

  public get Credentials$(): Observable<Credentials> {
    return this.credentials$;
  }

  public get Credentials(): Promise<Credentials> {
    return AsyncStorage.getItem(CredentialsKey).then((data) => Credentials.create(JSON.parse(data ?? "{}")));
  }

  public updateCredentials(credentials: ICredentials): Promise<void> {
    this.credentials$.next(Credentials.create(credentials));
    return AsyncStorage.setItem(CredentialsKey, JSON.stringify(credentials));
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;