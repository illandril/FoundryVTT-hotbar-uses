import getNumber from './getNumber';

it.each([
  [null, null, null],
  [null, { value: 4 }, null],
  [null, { value: 4 }, undefined],
  [null, { value: 4 }, ''],
  [4, { value: 4 }, 'value'],
  [4, { value: '4' }, 'value'],
  [4, { some: { value: '4' } }, 'some.value'],
  [null, { value: 'four' }, 'value'],
  [null, { value: 4 }, 'some.value'],
  [10, { value: '4' }, '10'],
])('returns %j for getNumber(%j, %j)', (expected, data, key) => {
  const actual = getNumber(data, key);
  expect(actual).toBe(expected);
});
