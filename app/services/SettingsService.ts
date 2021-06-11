import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsKey = "settings";
const DefaultSettings: Partial<AppSettings> = {
  language: "de",
};

export interface AppSettings {
  address: string;
  signature: string;
  walledId: string;
  language: string;
}

export const getSettings = (): Promise<AppSettings> => {
  return AsyncStorage.getItem(SettingsKey)
    .then((data) => ({ ...DefaultSettings, ...JSON.parse(data ?? "{}") }));
};

export const updateSettings = (update: Partial<AppSettings>): Promise<void> => {
  return getSettings()
    .then((settings) => JSON.stringify({ ...settings, ...update }))
    .then((settings) => AsyncStorage.setItem(SettingsKey, settings));
};
