const messageDefichain =
  "By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID:";
const messageGeneral =
  "By signing this message, you confirm that you are the sole owner of the provided Blockchain address. Your ID:";

export const signingCommand = (address: string) => {
  const isDefichain = address.match(/^((7|8)\w{33}|(t|d)\w{33}|(t|d)\w{41})$/) !== null;
  const message = `${isDefichain ? messageDefichain : messageGeneral} ${address}`.split(" ").join("_");
  return isDefichain ? `signmessage "${address}" "${message}"` : message;
};
