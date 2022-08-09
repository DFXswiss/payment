export const Environment = {
  debug: true,
  defaultLanguage: "DE",
  addressFormat: /^((7|8)\w{33}|(t|d)\w{33}|(t|d)\w{41}|0x\w{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39})$/,
  api: {
    baseUrl: "http://localhost:3000/v1",
    refUrl: "http://localhost:3000/app?code=",
  },
};
