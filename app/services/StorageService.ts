import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: singleton
export const StorageKeys = {
  Ref: "ref"
}

export const storeValue = <T>(key: string, value: T): Promise<T> => {
  return AsyncStorage.setItem(key, JSON.stringify(value)).then(() => value);
};

export const getValue = <T>(key: string): Promise<T> => {
  return AsyncStorage.getItem(key).then((data) => JSON.parse(data ?? "{}"));
};

export const getPrimitive = <T>(key: string): Promise<T | undefined> => {
  return AsyncStorage.getItem(key).then((data) => data ? JSON.parse(data) : undefined);
}

export const deleteValue = (key: string): Promise<void> => {
  return AsyncStorage.removeItem(key);
}
