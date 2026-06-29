import {
  AR_AREA_CODES,
  AR_CITIES,
  AR_STREETS,
  CL_CITIES,
  CL_STREETS,
  EMAIL_DOMAINS,
  FIRST_NAMES_F,
  FIRST_NAMES_M,
  LAST_NAMES,
  USER_AGENTS,
} from "./data";

function rInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randHex(n: number): string {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function randDigits(n: number): string {
  return Array.from({ length: n }, () => rInt(0, 9)).join("");
}

function formatDots(value: number | string): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export type Country = "AR" | "CL";
export type Gender = "M" | "F";
export type NationalIdStyle = "dotted" | "plain";

function formatNationalNumber(
  value: number | string,
  style: NationalIdStyle,
): string {
  return style === "dotted" ? formatDots(value) : String(value);
}

export function genDNI(style: NationalIdStyle = "dotted"): string {
  return formatNationalNumber(rInt(10_000_000, 99_999_999), style);
}

function cuitCheckDigit(digits: number[]): number | null {
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, digit, index) => acc + digit * mult[index], 0);
  const result = 11 - (sum % 11);
  if (result === 11) return 0;
  if (result === 10) return null;
  return result;
}

export function genCUIT(gender?: Gender): string {
  const prefix = gender === "F" ? 27 : 20;

  for (let attempt = 0; attempt < 100; attempt++) {
    const base = rInt(10_000_000, 99_999_999).toString().padStart(8, "0");
    const all = [...String(prefix), ...base].map(Number);
    const check = cuitCheckDigit(all);

    if (check !== null) {
      return `${prefix}-${base}-${check}`;
    }
  }

  return "20-00000000-0";
}

export function genCUIL(gender?: Gender): string {
  return genCUIT(gender);
}

export function genRUT(style: NationalIdStyle = "dotted"): string {
  const base = rInt(1_000_000, 25_000_000);
  const digits = base.toString().split("").map(Number).reverse();
  const series = [2, 3, 4, 5, 6, 7];
  const sum = digits.reduce(
    (acc, digit, index) => acc + digit * series[index % series.length],
    0,
  );
  const check = 11 - (sum % 11);
  const checkChar = check === 11 ? "0" : check === 10 ? "K" : String(check);

  return `${formatNationalNumber(base, style)}-${checkChar}`;
}

export function genGender(): Gender {
  return Math.random() < 0.5 ? "M" : "F";
}

export function genName(gender?: Gender): {
  first: string;
  last1: string;
  last2: string;
  full: string;
} {
  const resolvedGender = gender ?? genGender();
  const first = pick(resolvedGender === "M" ? FIRST_NAMES_M : FIRST_NAMES_F);
  const last1 = pick(LAST_NAMES);
  const last2 = pick(LAST_NAMES);

  return { first, last1, last2, full: `${first} ${last1} ${last2}` };
}

export function genDOB(minAge = 18, maxAge = 75): string {
  const now = new Date();
  const year = now.getFullYear() - rInt(minAge, maxAge);
  const month = rInt(1, 12);
  const day = rInt(1, 28);

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function genEmail(name: { first: string; last1: string }): string {
  const first = stripAccents(name.first).toLowerCase();
  const last = stripAccents(name.last1).toLowerCase();
  const domain = pick(EMAIL_DOMAINS);
  const suffix = rInt(10, 99);

  switch (rInt(0, 3)) {
    case 0:
      return `${first}.${last}@${domain}`;
    case 1:
      return `${first[0]}.${last}@${domain}`;
    case 2:
      return `${last}.${first}${suffix}@${domain}`;
    default:
      return `${first}${last}@${domain}`;
  }
}

export function genPhone(country: Country): string {
  if (country === "CL") {
    const n = randDigits(8);
    return `+56 9 ${n.slice(0, 4)} ${n.slice(4)}`;
  }

  const n = randDigits(8);
  if (Math.random() < 0.5) {
    return `+54 9 11 ${n.slice(0, 4)}-${n.slice(4)}`;
  }

  const area = pick(AR_AREA_CODES);
  return `+54 9 ${area} ${n.slice(0, 4)}-${n.slice(4)}`;
}

export function genUsername(name: { first: string; last1: string }): string {
  const first = stripAccents(name.first).toLowerCase();
  const last = stripAccents(name.last1).toLowerCase();
  const suffix = rInt(10, 99);

  switch (rInt(0, 2)) {
    case 0:
      return `${first}.${last}`;
    case 1:
      return `${first[0]}${last}${suffix}`;
    default:
      return `${first}_${last}`;
  }
}

export function genAddress(country: Country): string {
  if (country === "CL") {
    const street = pick(CL_STREETS);
    const num = rInt(100, 9999);
    const loc = pick(CL_CITIES);

    return `${street} ${num}, ${loc.city}, ${loc.region}`;
  }

  const street = pick(AR_STREETS);
  const num = rInt(100, 9999);
  const loc = pick(AR_CITIES);
  const cpSuffix = rInt(0, 999).toString().padStart(3, "0");

  return `${street} ${num}, ${loc.city}, ${loc.province} (${loc.cp.slice(0, -3) || loc.cp}${cpSuffix})`;
}

export function genIPv4(): string {
  return `${rInt(1, 254)}.${rInt(0, 255)}.${rInt(0, 255)}.${rInt(1, 254)}`;
}

export function genIPv6(): string {
  return Array.from({ length: 8 }, () => randHex(4)).join(":");
}

export function genMAC(): string {
  const first = ((rInt(0, 255) & 0xfe) | 0x02)
    .toString(16)
    .padStart(2, "0");
  const rest = Array.from({ length: 5 }, () => randHex(2));

  return [first, ...rest].join(":").toUpperCase();
}

export function genUA(): string {
  return pick(USER_AGENTS);
}

export function genPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;
  const password = [
    pick([...upper]),
    pick([...lower]),
    pick([...digits]),
    pick([...symbols]),
    ...Array.from({ length: 12 }, () => pick([...all])),
  ];

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

type CardBrand = "Visa" | "Mastercard" | "Amex";

function luhnCheckDigit(digits: number[]): number {
  let sum = 0;
  let shouldDouble = true;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
}

export function genCreditCard(): {
  number: string;
  brand: CardBrand;
  expiry: string;
} {
  const brand = pick<CardBrand>(["Visa", "Mastercard", "Amex"]);
  let prefix: number[];
  let length: number;

  if (brand === "Visa") {
    prefix = [4];
    length = 16;
  } else if (brand === "Mastercard") {
    prefix = [5, rInt(1, 5)];
    length = 16;
  } else {
    prefix = [3, pick([4, 7])];
    length = 15;
  }

  const fill = Array.from(
    { length: length - prefix.length - 1 },
    () => rInt(0, 9),
  );
  const withoutCheck = [...prefix, ...fill];
  const digits = [...withoutCheck, luhnCheckDigit(withoutCheck)];
  const formatted =
    brand === "Amex"
      ? `${digits.slice(0, 4).join("")} ${digits.slice(4, 10).join("")} ${digits.slice(10).join("")}`
      : [0, 4, 8, 12]
          .map((start) => digits.slice(start, start + 4).join(""))
          .join(" ");
  const now = new Date();
  const expMonth = String(rInt(1, 12)).padStart(2, "0");
  const expYear = String((now.getFullYear() + rInt(1, 4)) % 100).padStart(
    2,
    "0",
  );

  return { number: formatted, brand, expiry: `${expMonth}/${expYear}` };
}

function ibanMod97(value: string): number {
  let remainder = 0;

  for (const char of value) {
    const expanded =
      char >= "A" && char <= "Z" ? String(char.charCodeAt(0) - 55) : char;

    for (const digit of expanded) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder;
}

export function genIBAN(): string {
  const bankCode = rInt(1000, 9999).toString();
  const branchCode = rInt(1000, 9999).toString();
  const controlDigits = rInt(10, 99).toString();
  const accountNum = randDigits(10);
  const bban = `${bankCode}${branchCode}${controlDigits}${accountNum}`;
  const checkDigits = String(98 - ibanMod97(`${bban}ES00`)).padStart(2, "0");
  const raw = `ES${checkDigits}${bban}`;

  return raw.match(/.{1,4}/g)?.join(" ") ?? raw;
}

export interface FakeProfile {
  country: Country;
  gender: Gender;
  name: { first: string; last1: string; last2: string; full: string };
  id: string;
  cuit?: string;
  cuil?: string;
  dob: string;
  email: string;
  phone: string;
  username: string;
  address: string;
  ip: string;
  password: string;
  card: { number: string; brand: CardBrand; expiry: string };
}

export function genProfile(
  country: Country,
  nationalIdStyle: NationalIdStyle = "dotted",
): FakeProfile {
  const gender = genGender();
  const name = genName(gender);
  const dob = genDOB();
  const email = genEmail(name);
  const phone = genPhone(country);
  const username = genUsername(name);
  const address = genAddress(country);
  const ip = genIPv4();
  const password = genPassword();
  const card = genCreditCard();

  if (country === "AR") {
    return {
      country,
      gender,
      name,
      id: genDNI(nationalIdStyle),
      cuit: genCUIT(gender),
      cuil: genCUIL(gender),
      dob,
      email,
      phone,
      username,
      address,
      ip,
      password,
      card,
    };
  }

  return {
    country,
    gender,
    name,
    id: genRUT(nationalIdStyle),
    dob,
    email,
    phone,
    username,
    address,
    ip,
    password,
    card,
  };
}
