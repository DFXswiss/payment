export const Environment = {
  debug: true,
  defaultLanguage: "DE",
  addressFormat: /^((7|8)\w{33}|(t|d)\w{33}|(t|d)\w{41}|0x\w{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39})$/,
  api: {
    baseUrl: "https://dev.api.dfx.swiss/v1",
    refUrl: "https://dev.api.dfx.swiss/app?code=",
  },
};
