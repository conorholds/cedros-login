const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    zeros++;
  }

  let num = 0n;
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256n + BigInt(bytes[i]);
  }

  let str = "";
  while (num > 0n) {
    const remainder = Number(num % 58n);
    str = BASE58_ALPHABET[remainder] + str;
    num = num / 58n;
  }

  return "1".repeat(zeros) + str;
}
