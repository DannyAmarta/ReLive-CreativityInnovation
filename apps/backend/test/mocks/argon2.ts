export async function hash(value: string) {
  return `hashed:${value}`;
}

export async function verify(hashedValue: string, plainValue: string) {
  return hashedValue === `hashed:${plainValue}` || hashedValue === plainValue;
}
