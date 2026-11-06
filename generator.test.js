import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword, GROUPS } from './generator.js';
test('longitudes, alfabeto y presencia de todos los grupos seleccionados', () => {
  const keys = Object.keys(GROUPS);
  for (let mask = 1; mask < 16; mask++) {
    const selected = keys.filter((_, i) => mask & (1 << i));
    const alphabet = selected.map(key => GROUPS[key]).join('');
    for (const length of [8, 20, 128]) {
      const value = generatePassword(length, selected);
      assert.equal(value.length, length);
      assert.ok([...value].every(char => alphabet.includes(char)));
      for (const key of selected) assert.ok([...value].some(char => GROUPS[key].includes(char)));
    }
  }
});
test('rechaza configuraciones inválidas', () => {
  for (const length of [0, 7, 129, NaN, 12.5]) assert.throws(() => generatePassword(length, ['lower']));
  assert.throws(() => generatePassword(20, []));
  assert.throws(() => generatePassword(20, ['invalid']));
});

test('incluye la palabra literal con longitud exacta y grupos aleatorios', () => {
  for (const word of ['Milo', 'Ñoño', 'Jose\u0301', '123', '𐐀']) {
    const normalized = word.normalize('NFC');
    const value = generatePassword(20, Object.keys(GROUPS), word);
    assert.equal([...value].length, 20);
    assert.ok(value.includes(normalized));
    const remainder = value.replace(normalized, '');
    for (const group of Object.values(GROUPS)) assert.ok([...remainder].some(char => group.includes(char)));
  }
  const value = generatePassword(12, ['digits'], 'Milo');
  assert.match(value.replace('Milo', ''), /^\d{8}$/);
});
test('rechaza palabras inválidas o sin espacio suficiente para aleatoriedad', () => {
  for (const word of ['a b', '<script>', '🐶', 'a'.repeat(41), 123]) assert.throws(() => generatePassword(128, ['lower'], word));
  assert.throws(() => generatePassword(8, ['lower'], 'Milo'), /12/);
  assert.equal(generatePassword(20, ['digits'], '  ').length, 20);
});
