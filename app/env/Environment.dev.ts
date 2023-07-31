function getBitcoinAddressFormat(): string {
  return "([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,62}";
}

function getLightningAddressFormat(): string {
  return "(LNURL|LNDHUB)[A-Z0-9]{25,250}|LNNID[A-Z0-9]{66}";
}

function getEthereumAddressFormat(): string {
  return "0x\\w{40}";
}

function getDefichainAddressFormat(): string {
  return "[78]\\w{33}|[td]\\w{33}|[td]\\w{41}";
}

function getAllAddressFormat(): string {
  const bitcoin = getBitcoinAddressFormat();
  const lightning = getLightningAddressFormat();
  const ethereum = getEthereumAddressFormat();
  const defichain = getDefichainAddressFormat();

  return `${bitcoin}|${lightning}|${ethereum}|${defichain}`;
}

export const Environment = {
  debug: true,
  defaultLanguage: "DE",
  addressFormat: new RegExp(`^(${getAllAddressFormat()})$`),
  signatureFormat: /^(.{87}=|[a-f0-9]{130}|[a-f0-9x]{132}|[a-z0-9]{104}|[a-z0-9]{140,146})$/,
  api: {
    baseUrl: "https://dev.api.dfx.swiss/v1",
    refUrl: "https://dev.api.dfx.swiss/app?code=",
  },
};
