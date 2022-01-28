import { NavigationContainerRef } from "@react-navigation/core";
import { createRef, RefObject } from "react";
import { KycStatus } from "../models/User";

export const navigationRef: RefObject<NavigationContainerRef> = createRef();

export function navigate(name: string, params?: { [key: string | KycStatus]: string | KycStatus }) {
  navigationRef.current?.navigate(name, params);
}