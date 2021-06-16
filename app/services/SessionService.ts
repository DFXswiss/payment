import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observable, ReplaySubject } from "rxjs";
import { getUser } from "./ApiService";

// TODO: remove dummy data
const Address = "8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG";
const Signature = "Hwj3sJjBxMOnkPxZkGtqinGdASIOM6ffGDCcQsWA7kRIIjMP5/HMyuZwlLnBKuD6weD5c/8HIzMrmi6GpCmFU04=";

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

class SessionServiceClass {
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

  public login(credentials: ICredentials): Promise<void> {
    // TODO: login with API
    return this.updateCredentials(credentials);
  }

  public logout(): Promise<void> {
    return this.updateCredentials({ address: undefined, signature: undefined });
  }

  private updateCredentials(credentials: ICredentials): Promise<void> {
    this.credentials$.next(Credentials.create(credentials));
    return AsyncStorage.setItem(CredentialsKey, JSON.stringify(credentials));
  }
}

const SessionService = new SessionServiceClass();
export default SessionService;
