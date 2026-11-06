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
