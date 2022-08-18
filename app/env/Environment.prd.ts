export const Environment = {
  defaultLanguage: "DE",
  addressFormat: /^(8\w{33}|d\w{33}|d\w{41})$/,
  signatureFormat: /^(.{87}=|[a-f0-9]{130}|[a-f0-9x]{132})$/,
  api: {
    baseUrl: "https://api.dfx.swiss/v1",
    refUrl: "https://dfx.swiss/app?code=",
  },
};
