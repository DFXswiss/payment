import { useState } from "react";

export interface GetInfoResponse {
  node: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  methods: string[];
}

export interface AlbyInterface {
  isInstalled: boolean;
  isEnabled: boolean;
  enable: () => Promise<GetInfoResponse | undefined>;
  signMessage: (msg: string) => Promise<string>;
}

export function useAlby(): AlbyInterface {
  const { webln } = window as any;

  const [isEnabled, setIsEnabled] = useState(false);

  const isInstalled = Boolean(webln);

  function enable(): Promise<GetInfoResponse | undefined> {
    return webln
      .enable()
      .then(() => webln.getInfo())
      .catch(() => undefined)
      .then((r: GetInfoResponse) => {
        setIsEnabled(r != null);
        return r;
      });
  }

  function signMessage(msg: string): Promise<string> {
    return webln.signMessage(msg).then((r: { signature: string }) => r.signature);
  }

  return {
    isInstalled,
    isEnabled,
    enable,
    signMessage,
  };
}
