import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageServiceClass {
  public Keys = {
    Ref: "ref",
    WalletId: "wallet_id",
    Credentials: "credentials",
  };

  public storeValue<T>(key: string, value: T): Promise<T> {
    return AsyncStorage.setItem(key, JSON.stringify(value)).then(() => value);
  }

  public getValue<T>(key: string): Promise<T> {
    return AsyncStorage.getItem(key).then((data) => JSON.parse(data ?? "{}"));
  }

  public getPrimitive<T>(key: string): Promise<T | undefined> {
    return AsyncStorage.getItem(key)
      .then((data) => (data ? JSON.parse(data) : undefined))
      .catch(() => undefined);
  }

  public deleteValue(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}

const StorageService = new StorageServiceClass();
export default StorageService;
