export const GROUPS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?'
};
function randomIndex(limit) {
  const value = new Uint32Array(1);
  const ceiling = Math.floor(2 ** 32 / limit) * limit;
  do { crypto.getRandomValues(value); } while (value[0] >= ceiling);
  return value[0] % limit;
}
export function generatePassword(length, selected) {
  const groups = [...new Set(selected)].map(key => GROUPS[key]);
  if (!Number.isInteger(length) || length < 8 || length > 128 || !groups.length || groups.some(x => !x)) {
    throw new Error('Elegí una longitud de 8 a 128 y al menos un tipo de carácter.');
  }
  const alphabet = groups.join('');
  // Rejection sampling preserves a uniform distribution over passwords that
  // contain at least one character from every selected group.
  let result;
  do {
    result = Array.from({length}, () => alphabet[randomIndex(alphabet.length)]).join('');
  } while (!groups.every(group => [...result].some(char => group.includes(char))));
  return result;
}
