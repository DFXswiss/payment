import { DependencyList, useEffect } from "react";

const useLoader = (loader: (cancelled: () => boolean) => void, deps?: DependencyList) => {
  let cancelled = false;
  useEffect(() => {
    loader(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, deps);
};

export default useLoader;