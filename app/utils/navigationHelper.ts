import { NavigationContainerRef } from '@react-navigation/core';
import * as React from 'react';

export const navigationRef: React.RefObject<NavigationContainerRef> = React.createRef();

export function navigate(name: string, params?: {[key: string]: string}) {
  navigationRef.current?.navigate(name, params);
}