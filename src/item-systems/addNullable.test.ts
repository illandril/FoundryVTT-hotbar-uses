import addNullable from './addNullable';

it.each([
  [null, null, null],
  [1, null, 1],
  [1, 1, null],
  [3, null, 3],
  [3, 3, null],
  [1, 0, 1],
  [3, 1, 2],
])('returns %j for addNullable(%j, %j)', (expected, current, addition) => {
  const actual = addNullable(current, addition);
  expect(actual).toBe(expected);
});
