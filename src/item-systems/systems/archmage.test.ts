import { calculateUses } from '../';

beforeAll(() => {
  const actor1Items = new Map<string, Item>();
  const actor1 = {
    id: 'mock-actor-1',
    name: 'Alice',
    items: {
      get: (id) => actor1Items.get(id),
      find: (condition) => [...actor1Items.values()].find((value, index) => condition(value, index, {} as foundry.utils.Collection<string, Item>)),
      filter: (condition) => [...actor1Items.values()].filter((value, index) => condition(value, index, {} as foundry.utils.Collection<string, Item>)),
    },
  } as Actor;
  actor1Items.set('mock-item-1.1', {
    id: 'mock-item-1.1',
    name: 'Numeric',
    system: {
      quantity: { value: 1 },
      maxQuantity: { value: 2 },
    },
  } as Item);
  actor1Items.set('mock-item-1.2', {
    id: 'mock-item-1.2',
    name: 'None',
    system: {},
  } as Item);
  actor1Items.set('mock-item-1.3', {
    id: 'mock-item-1.3',
    name: 'String',
    system: {
      quantity: { value: '2' },
      maxQuantity: { value: '3' },
    },
  } as Item);
  actor1Items.set('mock-item-1.4', {
    id: 'mock-item-1.4',
    name: 'Max Only',
    system: {
      quantity: { value: null },
      maxQuantity: { value: 5 },
    },
  } as Item);
  actor1Items.set('mock-item-1.5', {
    id: 'mock-item-1.5',
    name: 'Quantity Only',
    system: {
      quantity: { value: 5 },
      maxQuantity: { value: null },
    },
  } as Item);

  const actors = new Map<string, Actor>();
  actors.set(actor1.id, actor1);


  jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
    actor: actor1.id,
  });
  jest.spyOn(game.actors, 'get').mockImplementation((id) => actors.get(id)!);
  jest.spyOn(game.actors, 'find').mockImplementation(
    (predicate) => [...actors.values()].find(
      (value, index) => predicate(value, index, {} as foundry.utils.Collection<string, Actor>),
    ),
  );
});

beforeAll(() => {
  jest.replaceProperty(game.system, 'id', 'archmage');
});

it('returns 1/2 for Numeric', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("Numeric");');

  expect(actual).toEqual({
    available: 1,
    maximum: 2,
    showZeroUses: true,
  });
});

it('returns 2/3 for String', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("String");');

  expect(actual).toEqual({
    available: 2,
    maximum: 3,
    showZeroUses: true,
  });
});

it('returns 0/5 for Max Only', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("Max Only");');

  expect(actual).toEqual({
    available: 0,
    maximum: 5,
    showZeroUses: true,
  });
});

it('returns null for None', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("None");');

  expect(actual).toEqual(null);
});

it('returns null for Quantity Only', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("Quantity Only");');

  expect(actual).toEqual(null);
});

it('returns 0 for Missing', async () => {
  const actual = await calculateUses('game.archmage.rollItemMacro("Missing");');

  expect(actual).toEqual({
    available: 0,
  });
});
