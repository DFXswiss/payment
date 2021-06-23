import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observable, ReplaySubject } from "rxjs";
import { Environment } from "../env/Environment";

const SettingsKey = "settings";
const DefaultSettings: Partial<AppSettings> = {
  language: Environment.defaultLanguage,
};

export interface AppSettings {
  language: string;
}

class SettingsServiceClass {
  private settings$ = new ReplaySubject<AppSettings>();

  constructor() {
    this.Settings.then((settings) => this.settings$.next(settings));
  }

  public get Settings$(): Observable<AppSettings> {
    return this.settings$;
  }

  public get Settings(): Promise<AppSettings> {
    return AsyncStorage.getItem(SettingsKey).then((data) => ({ ...DefaultSettings, ...JSON.parse(data ?? "{}") }));
  }

  public updateSettings(update: Partial<AppSettings>): Promise<void> {
    return this.Settings.then((settings) => ({ ...settings, ...update }))
      .then((settings) => AsyncStorage.setItem(SettingsKey, JSON.stringify(settings)).then(() => settings))
      .then((settings) => this.settings$.next(settings));
  }
}

const SettingsService = new SettingsServiceClass();
export default SettingsService;
