import { useIsFocused, useNavigation } from "@react-navigation/native";
import { DependencyList, useEffect } from "react";
import Routes from "../config/Routes";

const useGuard = (isUnauthorized: () => Promise<boolean | undefined> | boolean | undefined, deps: DependencyList = [], fallBackRoute: string = Routes.Login) => {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      Promise.resolve(isUnauthorized()).then((unauthorized) => {
        if (isFocused && unauthorized) {
          nav.navigate(fallBackRoute);
        }
      })
    }
  }, [isFocused, ...deps]);
}

export default useGuard;