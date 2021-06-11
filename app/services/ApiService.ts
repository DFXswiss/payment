// TODO: move to environment?
const BaseUrl = "https://api.fiat2defi.ch/api/v1";
const UserUrl = "user";

// TODO: move to model folder?
export interface User {
  address: string;
  signature: string;

  firstname: string;
  surname: string;
  street: string;
  zip: string;
  location: string;
  mail: string;
  phone_number: string;

  ref: string;
  used_ref: string;
  wallet_id: number;

  created: string;
  IP: string;
}

// TODO: remove dummy data
const Address = "8MTm4jQ2FHbrxZRbbKkTWgAHYv5hCASU22";
const Signature =
  "IMFmkM25tqVtrva3m7xFd+py91i7q/23FJ8bSl7No0VgVcQo4ATV19+XoS+tLlydtS1gj2zl0Zb0XL2GDj/bw22=";
const DummyUser: User = {
  IP: "192.192.192.192",
  address: "8MTm4jQ2FHbrxZRbbKkTWgAHYv5hCASU22",
  created: "2021-06-09T12:59:03",
  firstname: "David",
  location: "",
  mail: "test@google.com",
  phone_number: "",
  ref: "000-005",
  signature:
    "IMFmkM25tqVtrva3m7xFd+py91i7q/23FJ8bSl7No0VgVcQo4ATV19+XoS+tLlydtS1gj2zl0Zb0XL2GDj/bw22=",
  street: "",
  surname: "",
  used_ref: "010-000",
  wallet_id: 0,
  zip: "",
};

export const getUser = (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(DummyUser), 1000);
  });

  return fetch(`${BaseUrl}/${UserUrl}/${Address}?signature=${Signature}`)
    .then((response) => response.json())
    .catch(); // TODO: error handling?
};

export const postUser = (user: User): Promise<User> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((response) => response.json());
};

export const putUser = (user: User): Promise<User> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}/${Address}?signature=${Signature}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((response) => response.json());
};
