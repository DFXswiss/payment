import { NavigationContainerRef } from "@react-navigation/core";
import { createRef, RefObject } from "react";

export const navigationRef: RefObject<NavigationContainerRef> = createRef();

export function navigate(name: string, params?: { [key: string]: string }) {
  navigationRef.current?.navigate(name, params);
}
