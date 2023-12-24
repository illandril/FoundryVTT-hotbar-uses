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
    name: 'TNumeric',
    type: 'talent',
    system: {
      uses: { value: 0, max: 1 },
    },
  } as Item);
  actor1Items.set('mock-item-1.2', {
    id: 'mock-item-1.2',
    name: 'TNone',
    type: 'talent',
    system: {
      castings: { value: 2, max: 2 },
    },
  } as Item);
  actor1Items.set('mock-item-1.3', {
    id: 'mock-item-1.3',
    name: 'TString',
    type: 'talent',
    system: {
      uses: { value: '3', max: '4' },
    },
  } as Item);
  actor1Items.set('mock-item-1.4', {
    id: 'mock-item-1.4',
    name: 'TMax Only',
    type: 'talent',
    system: {
      uses: { value: null, max: 5 },
    },
  } as Item);
  actor1Items.set('mock-item-1.5', {
    id: 'mock-item-1.5',
    name: 'TQuantity Only',
    type: 'talent',
    system: {
      uses: { value: 6, max: null },
    },
  } as Item);

  actor1Items.set('mock-item-2.1', {
    id: 'mock-item-2.1',
    name: 'SNumeric',
    type: 'spell',
    system: {
      castings: { value: 7, max: 8 },
    },
  } as Item);
  actor1Items.set('mock-item-2.2', {
    id: 'mock-item-2.2',
    name: 'SNone',
    type: 'spell',
    system: {
      uses: { value: 2, max: 2 },
    },
  } as Item);
  actor1Items.set('mock-item-2.3', {
    id: 'mock-item-2.3',
    name: 'SString',
    type: 'spell',
    system: {
      castings: { value: '9', max: '10' },
    },
  } as Item);
  actor1Items.set('mock-item-2.4', {
    id: 'mock-item-2.4',
    name: 'SMax Only',
    type: 'spell',
    system: {
      castings: { value: null, max: 11 },
    },
  } as Item);
  actor1Items.set('mock-item-2.5', {
    id: 'mock-item-2.5',
    name: 'SQuantity Only',
    type: 'spell',
    system: {
      castings: { value: 12, max: null },
    },
  } as Item);
  actor1Items.set('mock-item-3.1', {
    id: 'mock-item-3.1',
    name: 'Other',
    type: 'other',
    system: {
      uses: { value: 7, max: 7 },
      castings: { value: 9, max: 9 },
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
  jest.replaceProperty(game.system, 'id', 'demonlord');
});

it('returns 0/1 for TNumeric', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("TNumeric");');

  expect(actual).toEqual({
    consumed: 0,
    maximum: 1,
    showZeroUses: true,
  });
});

it('returns 3/4 for TString', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("TString");');

  expect(actual).toEqual({
    consumed: 3,
    maximum: 4,
    showZeroUses: true,
  });
});

it('returns 0/5 for TMax Only', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("TMax Only");');

  expect(actual).toEqual({
    consumed: 0,
    maximum: 5,
    showZeroUses: true,
  });
});

it('returns null for TNone', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("TNone");');

  expect(actual).toEqual(null);
});

it('returns null for TQuantity Only', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("TQuantity Only");');

  expect(actual).toEqual({
    consumed: 6,
    maximum: 0,
    showZeroUses: true,
  });
});

it('returns 0 for Missing (talent)', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("Missing");');

  expect(actual).toEqual({
    available: 0,
  });
});

it('returns null for Other (talent)', async () => {
  const actual = await calculateUses('game.demonlord.rollTalentMacro("Other");');

  expect(actual).toEqual(null);
});

it('returns 7/8 for SNumeric', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("SNumeric");');

  expect(actual).toEqual({
    consumed: 7,
    maximum: 8,
    showZeroUses: true,
  });
});

it('returns 9/10 for SString', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("SString");');

  expect(actual).toEqual({
    consumed: 9,
    maximum: 10,
    showZeroUses: true,
  });
});

it('returns 0/11 for SMax Only', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("SMax Only");');

  expect(actual).toEqual({
    consumed: 0,
    maximum: 11,
    showZeroUses: true,
  });
});

it('returns null for SNone', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("SNone");');

  expect(actual).toEqual(null);
});

it('returns 12/0 for SQuantity Only', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("SQuantity Only");');

  expect(actual).toEqual({
    consumed: 12,
    maximum: 0,
    showZeroUses: true,
  });
});

it('returns 0 for Missing (spell)', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("Missing");');

  expect(actual).toEqual({
    available: 0,
  });
});

it('returns null for Other (spell)', async () => {
  const actual = await calculateUses('game.demonlord.rollSpellMacro("Other");');

  expect(actual).toEqual(null);
});

// Test the many different types of macros that should all lookup details for TNumeric
it.each([
  // Roll Talent macro
  'game.demonlord.rollTalentMacro("TNumeric")',
  ' game . demonlord . rollTalentMacro ( "TNumeric" ) ; ',
  'game.demonlord.rollTalentMacro(\'TNumeric\')',
  'game.demonlord.rollTalentMacro(`TNumeric`)',
  '// Active = [true/false/], blank = toggle true/false.\ngame.demonlord.rollTalentMacro("TNumeric", "true")',

  // Comment: // HotbarUsesDemonLord: ActorID="X" ItemID="Y"
  'doSomething();//HotbarUsesDemonLord:ActorID="mock-actor-1"ItemID="mock-item-1.1"\ndoSomething();',
  ' // HotbarUsesDemonLord : ActorID = "mock-actor-1" ItemID = "mock-item-1.1" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorID=\'mock-actor-1\' ItemID=\'mock-item-1.1\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorID=`mock-actor-1` ItemID=`mock-item-1.1`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorID="mock-actor-1" ItemID=`mock-item-1.1`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ItemName="Y"
  'doSomething();//HotbarUsesDemonLord:ItemName="TNumeric"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ItemName = "TNumeric" \ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=\'TNumeric\'\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`TNumeric`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ActorName="X" ItemName="Y"
  'doSomething();//HotbarUsesDemonLord:ActorName="Alice"ItemName="TNumeric"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ActorName = "Alice" ItemName = "TNumeric" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=\'TNumeric\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=`Alice` ItemName=`TNumeric`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=`TNumeric`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUsesDemonLord:ItemName="TNumeric"ItemType="talent"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ItemName = "TNumeric" ItemType = "talent" \ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=\'TNumeric\' ItemType=\'talent\'\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`TNumeric` ItemType=`talent`\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`TNumeric` ItemType="talent"\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ActorName="X" ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUsesDemonLord:ActorName="Alice"ItemName="TNumeric"ItemType="talent"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ActorName = "Alice" ItemName = "TNumeric" ItemType = "talent" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=\'TNumeric\' ItemType=\'talent\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=`Alice` ItemName=`TNumeric` ItemType=`talent`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=`TNumeric` ItemType="talent"\ndoSomething();',

  // Comment: // HotbarUsesGeneric
  '// HotbarUsesGeneric\n// ActorID=mock-actor-1\n// ItemName=TNumeric\n// Consumed=system.uses.value\n// Max=system.uses.max\ndoSomething();',
])('command=%j', async (command) => {
  const actual = await calculateUses(command);

  expect(actual).toEqual({
    consumed: 0,
    maximum: 1,
    showZeroUses: true,
  });
});

// Test the many different types of macros that should all lookup details for SNumeric
it.each([
  // Roll Spell macro
  'game.demonlord.rollSpellMacro("SNumeric")',
  ' game . demonlord . rollSpellMacro ( "SNumeric" ) ; ',
  'game.demonlord.rollSpellMacro(\'SNumeric\')',
  'game.demonlord.rollSpellMacro(`SNumeric`)',

  // Comment: // HotbarUsesDemonLord: ActorID="X" ItemID="Y"
  'doSomething();//HotbarUsesDemonLord:ActorID="mock-actor-1"ItemID="mock-item-2.1"\ndoSomething();',
  ' // HotbarUsesDemonLord : ActorID = "mock-actor-1" ItemID = "mock-item-2.1" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorID=\'mock-actor-1\' ItemID=\'mock-item-2.1\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorID=`mock-actor-1` ItemID=`mock-item-2.1`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorID="mock-actor-1" ItemID=`mock-item-2.1`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ItemName="Y"
  'doSomething();//HotbarUsesDemonLord:ItemName="SNumeric"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ItemName = "SNumeric" \ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=\'SNumeric\'\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`SNumeric`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ActorName="X" ItemName="Y"
  'doSomething();//HotbarUsesDemonLord:ActorName="Alice"ItemName="SNumeric"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ActorName = "Alice" ItemName = "SNumeric" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=\'SNumeric\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=`Alice` ItemName=`SNumeric`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=`SNumeric`\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUsesDemonLord:ItemName="SNumeric"ItemType="spell"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ItemName = "SNumeric" ItemType = "spell" \ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=\'SNumeric\' ItemType=\'spell\'\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`SNumeric` ItemType=`spell`\ndoSomething();',
  '// HotbarUsesDemonLord: ItemName=`SNumeric` ItemType="spell"\ndoSomething();',

  // Comment: // HotbarUsesDemonLord: ActorName="X" ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUsesDemonLord:ActorName="Alice"ItemName="SNumeric"ItemType="spell"\ndoSomething();',
  'doSomething();\n// HotbarUsesDemonLord : ActorName = "Alice" ItemName = "SNumeric" ItemType = "spell" \ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=\'SNumeric\' ItemType=\'spell\'\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=`Alice` ItemName=`SNumeric` ItemType=`spell`\ndoSomething();',
  '// HotbarUsesDemonLord: ActorName=\'Alice\' ItemName=`SNumeric` ItemType="spell"\ndoSomething();',

  // Comment: // HotbarUsesGeneric
  '// HotbarUsesGeneric\n// ActorID=mock-actor-1\n// ItemName=SNumeric\n// Consumed=system.castings.value\n// Max=system.castings.max\ndoSomething();',
])('command=%j', async (command) => {
  const actual = await calculateUses(command);

  expect(actual).toEqual({
    consumed: 7,
    maximum: 8,
    showZeroUses: true,
  });
});

