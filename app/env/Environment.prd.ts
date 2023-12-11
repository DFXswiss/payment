const bitcoinAddressFormat = "([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,62}";
const lightningAddressFormat = "(LNURL|LNDHUB)[A-Z0-9]{25,250}|LNNID[A-Z0-9]{66}";
const moneroAddressFormat = "[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}";
const ethereumAddressFormat = "0x\\w{40}";
const defichainAddressFormat = "8\\w{33}|d\\w{33}|d\\w{41}";

const allAddressFormat = `${bitcoinAddressFormat}|${lightningAddressFormat}|${moneroAddressFormat}|${ethereumAddressFormat}|${defichainAddressFormat}`;

const bitcoinSignatureFormat = ".{87}=";
const lightningSignatureFormat = "[a-z0-9]{104}";
const lightningCustodialSignatureFormat = "[a-z0-9]{140,146}";
const moneroSignatureFormat = "SigV\\d[0-9a-zA-Z]{88}";
const ethereumSignatureFormat = "(0x)?[a-f0-9]{130}";

const allSignatureFormat = `${bitcoinSignatureFormat}|${lightningSignatureFormat}|${lightningCustodialSignatureFormat}|${moneroSignatureFormat}|${ethereumSignatureFormat}`;

export const Environment = {
  defaultLanguage: "DE",
  addressFormat: new RegExp(`^(${allAddressFormat})$`),
  signatureFormat: new RegExp(`^(${allSignatureFormat})$`),
  api: {
    baseUrl: "https://api.dfx.swiss/v1",
    refUrl: "https://dfx.swiss/app?code=",
  },
  services: "https://services.dfx.swiss",
};
