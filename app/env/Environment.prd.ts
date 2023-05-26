export const Environment = {
  defaultLanguage: "DE",
  addressFormat: /^(8\w{33}|d\w{33}|d\w{41}|0x\w{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}|LNURL[A-Z0-9]{25,250})$/,
  signatureFormat: /^(.{87}=|[a-f0-9]{130}|[a-f0-9x]{132}|[a-z0-9]{104})$/,
  api: {
    baseUrl: "https://api.dfx.swiss/v1",
    refUrl: "https://dfx.swiss/app?code=",
  },
};
