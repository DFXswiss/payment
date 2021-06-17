import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observable, ReplaySubject } from "rxjs";
import { getUser, postUser } from "./ApiService";

const CredentialsKey = "credentials";
const WalletId = 0;

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
    return (
      getUser(credentials)
        .catch(() => postUser({ address: credentials.address ?? "", signature: credentials.signature ?? "", walletId: WalletId }))
        .then(() => this.updateCredentials(credentials))
    );
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
