import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import Routes from "../config/Routes";

const useGuard = (isUnauthorized: () => boolean | undefined) => {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isUnauthorized()) {
      nav.navigate(Routes.Login);
    }
  }, [isFocused])
}

export default useGuard;