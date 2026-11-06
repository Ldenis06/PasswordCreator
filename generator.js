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
export function generatePassword(length, selected, word = '') {
  const groups = [...new Set(selected)].map(key => GROUPS[key]);
  if (!Number.isInteger(length) || length < 8 || length > 128 || !groups.length || groups.some(x => !x)) {
    throw new Error('Elegí una longitud de 8 a 128 y al menos un tipo de carácter.');
  }
  if (typeof word !== 'string') throw new Error('Ingresá una palabra válida.');
  word = word.trim().normalize('NFC');
  const characters = [...word];
  if (characters.length > 40 || (word && !/^[\p{L}\p{N}]+$/u.test(word))) {
    throw new Error('Usá una palabra de hasta 40 letras o números, sin espacios ni símbolos.');
  }
  if (word && length - characters.length < 8) {
    throw new Error(`Aumentá la longitud a ${characters.length + 8} o más para dejar al menos 8 caracteres aleatorios.`);
  }
  const randomLength = length - characters.length;
  const alphabet = groups.join('');
  // Rejection sampling preserves a uniform distribution over passwords that
  // contain at least one character from every selected group.
  let result;
  do {
    result = Array.from({length: randomLength}, () => alphabet[randomIndex(alphabet.length)]).join('');
  } while (!groups.every(group => [...result].some(char => group.includes(char))));
  if (!word) return result;
  const position = randomIndex(result.length + 1);
  return result.slice(0, position) + word + result.slice(position);
}
