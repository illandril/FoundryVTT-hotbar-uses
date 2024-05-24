import { calculateUses } from '../';

beforeAll(() => {
  const actor1Items = new Map<string, dnd5e.documents.Item5e>();
  const actor1 = {
    id: 'mock-actor-1',
    name: 'Alice',
    items: {
      get: (id) => actor1Items.get(id),
      find: (condition) =>
        [...actor1Items.values()].find((value, index) =>
          condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>),
        ),
      filter: (condition) =>
        [...actor1Items.values()].filter((value, index) =>
          condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>),
        ),
    },
    system: {
      spells: {
        pact: {
          value: 1,
          max: 2,
        },
        spell1: {
          value: 2,
          max: 4,
        },
        spell2: {
          value: 3,
          max: 3,
        },
      },
    },
  } as dnd5e.documents.Actor5e;
  actor1Items.set('mock-item-1.1', {
    name: 'Light Crossbow',
    type: 'weapon',
    system: {
      quantity: 2,
      uses: {
        value: 0,
        max: '',
        per: 'charges',
        recovery: '',
      },
      consume: {
        type: 'ammo',
        target: 'mock-item-1.2',
        amount: 1,
      },
      properties: {
        ret: false,
        thr: false,
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.2', {
    id: 'mock-item-1.2',
    name: 'Crossbow Bolt',
    type: 'consumable',
    system: {
      quantity: 19,
      uses: {
        value: 0,
        max: '',
        per: null,
        recovery: '',
      },
      consume: {
        type: '',
        target: '',
        amount: null,
      },
      properties: {},
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.3', {
    id: 'mock-item-1.3',
    name: 'Throwing Dagger',
    type: 'weapon',
    system: {
      quantity: 3,
      uses: {
        value: 0,
        max: '',
        per: null,
        recovery: '',
      },
      consume: {
        type: '',
        target: '',
        amount: null,
      },
      properties: {
        ret: false,
        thr: true,
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.4', {
    id: 'mock-item-1.4',
    name: 'Boomerang',
    type: 'weapon',
    system: {
      quantity: 2,
      uses: {
        value: 0,
        max: '',
        per: null,
        recovery: '',
      },
      consume: {
        type: '',
        target: '',
        amount: null,
      },
      properties: {
        ret: true,
        thr: true,
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.5', {
    id: 'mock-item-1.5',
    name: 'Dagger',
    type: 'weapon',
    system: {
      quantity: 3,
      uses: {
        value: 0,
        max: '',
        per: null,
        recovery: '',
      },
      consume: {
        type: '',
        target: '',
        amount: null,
      },
      properties: {
        ret: false,
        thr: false,
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.6', {
    id: 'mock-item-1.6',
    name: 'Multiple',
    type: 'consumable',
    system: {
      quantity: 2,
      uses: {
        value: 2,
        max: 3,
        per: null,
        recovery: '',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.7', {
    id: 'mock-item-1.7',
    name: 'Multiple',
    type: 'consumable',
    system: {
      quantity: 1,
      uses: {
        value: 10,
        max: 14,
        per: null,
        recovery: '',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.8', {
    id: 'mock-item-1.8',
    name: 'Multiple',
    type: 'consumable',
    system: {
      quantity: 2,
      uses: {
        value: 1,
        max: 1,
        per: null,
        recovery: '',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.9', {
    id: 'mock-item-1.9',
    name: 'Light',
    type: 'spell',
    system: {
      level: 0,
      preparation: {
        mode: 'prepared',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.10', {
    id: 'mock-item-1.10',
    name: 'Disguise Self',
    type: 'spell',
    system: {
      level: 1,
      preparation: {
        mode: 'atwill',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.11', {
    id: 'mock-item-1.11',
    name: 'Heroism',
    type: 'spell',
    system: {
      level: 1,
      preparation: {
        mode: 'prepared',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.12', {
    id: 'mock-item-1.12',
    name: 'Blur',
    type: 'spell',
    system: {
      level: 2,
      preparation: {
        mode: 'always',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);
  actor1Items.set('mock-item-1.13', {
    id: 'mock-item-1.13',
    name: 'Charm Person',
    type: 'spell',
    system: {
      level: 1,
      preparation: {
        mode: 'pact',
      },
    },
    actor: actor1,
  } as dnd5e.documents.Item5e);

  const actor2Items = new Map<string, dnd5e.documents.Item5e>();
  const actor2 = {
    id: 'mock-actor-2',
    name: 'Bob',
    items: {
      get: (id) => actor2Items.get(id),
      find: (condition) =>
        [...actor2Items.values()].find((value, index) =>
          condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>),
        ),
      filter: (condition) =>
        [...actor2Items.values()].filter((value, index) =>
          condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>),
        ),
    },
  } as dnd5e.documents.Actor5e;
  actor2Items.set('mock-item-2.1', {
    id: 'mock-item-2.1',
    name: 'Throwing Dagger',
    type: 'weapon',
    system: {
      quantity: 5,
      uses: {
        value: 0,
        max: '',
        per: null,
        recovery: '',
      },
      consume: {
        type: '',
        target: '',
        amount: null,
      },
      properties: {
        ret: false,
        thr: true,
      },
    },
    actor: actor2,
  } as dnd5e.documents.Item5e);

  const actors = new Map<string, Actor>();
  actors.set(actor1.id, actor1);
  actors.set(actor2.id, actor2);

  jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
    actor: actor1.id,
  });
  jest.spyOn(game.actors, 'get').mockImplementation((id) => actors.get(id)!);
  jest
    .spyOn(game.actors, 'find')
    .mockImplementation((predicate) =>
      [...actors.values()].find((value, index) =>
        predicate(value, index, {} as foundry.utils.Collection<string, Actor>),
      ),
    );
});

beforeAll(() => {
  jest.replaceProperty(game.system, 'id', 'dnd5e');
});

it('returns 19 for Light Crossbow (ammo quantity)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Light Crossbow")');

  expect(actual).toEqual({
    available: 19,
    isAmmunition: true,
  });
});

it('returns 17 / 22 for Multiple (combining multiple item charges)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Multiple")');

  expect(actual).toEqual({
    showZeroUses: true,
    available: 17,
    maximum: 22,
  });
});

it('returns 3 for Dagger (weapon, throwable, not returning) for Alice (actor by Speaker)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Throwing Dagger")');

  expect(actual).toEqual({
    available: 3,
    showZeroUses: true,
  });
});

it('returns 3 for Throwing Dagger for Alice (actor by name)', async () => {
  const actual = await calculateUses('BetterRolls.quickRollByName("Alice", "Throwing Dagger")');

  expect(actual).toEqual({
    available: 3,
    showZeroUses: true,
  });
});

it('returns 5 for Throwing Dagger for Bob (actor by name)', async () => {
  const actual = await calculateUses('BetterRolls.quickRollByName("Bob", "Throwing Dagger")');

  expect(actual).toEqual({
    available: 5,
    showZeroUses: true,
  });
});

it('returns null for Boomerang (weapon, throwable, returning)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Boomerang")');

  expect(actual).toEqual(null);
});

it('returns null for Dagger (weapon, not throwable)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Dagger")');

  expect(actual).toEqual(null);
});

it('returns 0 for Reggad (no item)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Reggad")');

  expect(actual).toEqual({
    available: 0,
  });
});

it('returns null for Light (spell, cantrip)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Light")');

  expect(actual).toEqual(null);
});

it('returns null for Disguise Self (spell, at will)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Disguise Self")');

  expect(actual).toEqual(null);
});

it('returns 2 / 4 for Heroism (spell, level 1)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Heroism")');

  expect(actual).toEqual({
    available: 2,
    maximum: 4,
    showZeroUses: true,
  });
});

it('returns 3 / 3 for Blur (spell, level 2)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Blur")');

  expect(actual).toEqual({
    available: 3,
    maximum: 3,
    showZeroUses: true,
  });
});

it('returns 1 / 2 for Charm Person (spell, pact)', async () => {
  const actual = await calculateUses('dnd5e.documents.macro.rollItem("Charm Person")');

  expect(actual).toEqual({
    available: 1,
    maximum: 2,
    showZeroUses: true,
  });
});

// Test the many different types of macros that should all lookup details for Alice's Throwing Dagger
it.each([
  // Legacy dnd5e system Roll Item macros
  'game.dnd5e.rollItemMacro("Throwing Dagger")',
  '\n game  .   dnd5e    .     rollItemMacro    ( \n  "Throwing Dagger" \n ) ;',
  'game.dnd5e.rollItemMacro(`Throwing Dagger`)',
  "game.dnd5e.rollItemMacro('Throwing Dagger')",
  'game.dnd5e.macros.rollItem("Throwing Dagger")',
  ' game . dnd5e . macros . rollItem ( "Throwing Dagger" ) ; ',
  'game.dnd5e.macros.rollItem(`Throwing Dagger`)',
  "game.dnd5e.macros.rollItem('Throwing Dagger')",

  // Standard dnd5e system Roll Item macro
  'dnd5e.documents.macro.rollItem("Throwing Dagger")',
  ' dnd5e . documents . macro . rollItem ( "Throwing Dagger" ) ; ',
  'dnd5e.documents.macro.rollItem(`Throwing Dagger`)',
  "dnd5e.documents.macro.rollItem('Throwing Dagger')",

  // MinorQOL.doRoll
  'MinorQOL.doRoll(event,"Throwing Dagger",{type:"weapon"})',
  ' MinorQOL . doRoll ( event , "Throwing Dagger" , { type : "weapon" } ) ; ',
  "MinorQOL.doRoll(event,'Throwing Dagger',{type:'weapon'})",
  'MinorQOL.doRoll(event,`Throwing Dagger`,{type:`weapon`})',
  'MinorQOL.doRoll(event,"Throwing Dagger",{type:`weapon`})',
  'MinorQOL.doRoll(event,"Throwing Dagger",{mimetype:"text/plain",type:"weapon",color:"red"})',

  // BetterRolls.quickRoll(itemName)
  'BetterRolls.quickRoll("Throwing Dagger")',
  ' BetterRolls . quickRoll ( "Throwing Dagger" ) ; ',
  'BetterRolls.quickRoll(`Throwing Dagger`)',
  "BetterRolls.quickRoll('Throwing Dagger')",

  // BetterRolls.vanillaRoll(actorId, itemId)
  'BetterRolls.vanillaRoll("mock-actor-1","mock-item-1.3")',
  ' BetterRolls . vanillaRoll ( "mock-actor-1" , "mock-item-1.3" ) ; ',
  "BetterRolls.vanillaRoll('mock-actor-1','mock-item-1.3')",
  'BetterRolls.vanillaRoll(`mock-actor-1`,`mock-item-1.3`)',
  'BetterRolls.vanillaRoll("mock-actor-1",`mock-item-1.3`)',

  // BetterRolls.quickRollById(actorId, itemId)
  'BetterRolls.quickRollById("mock-actor-1","mock-item-1.3")',
  ' BetterRolls . quickRollById ( "mock-actor-1" , "mock-item-1.3" ) ; ',
  "BetterRolls.quickRollById('mock-actor-1','mock-item-1.3')",
  'BetterRolls.quickRollById(`mock-actor-1`,`mock-item-1.3`)',
  'BetterRolls.quickRollById("mock-actor-1",`mock-item-1.3`)',

  // BetterRolls.quickRollByName(actorId, itemId)
  'BetterRolls.quickRollByName("Alice","Throwing Dagger")',
  ' BetterRolls . quickRollByName ( "Alice" , "Throwing Dagger" ) ; ',
  "BetterRolls.quickRollByName('Alice','Throwing Dagger')",
  'BetterRolls.quickRollByName(`Alice`,`Throwing Dagger`)',
  'BetterRolls.quickRollByName("Alice",`Throwing Dagger`)',

  // BetterRolls 1.5.0 macros
  'const actorId="mock-actor-1";const itemId="mock-item-1.3";const actorToRoll=game.actors.get(actorId);const itemToRoll=actorToRoll.items.get(itemId);itemToRoll.roll();',
  'const actorId = "mock-actor-1";\nconst itemId = "mock-item-1.3";\nconst actorToRoll = game.actors.get(actorId);\nconst itemToRoll = actorToRoll.items.get(itemId);\nitemToRoll.roll();',

  // ItemMacro.runMacro(actorId, itemId)
  'ItemMacro.runMacro("mock-actor-1","mock-item-1.3")',
  ' ItemMacro . runMacro ( "mock-actor-1" , "mock-item-1.3" ) ; ',
  "ItemMacro.runMacro('mock-actor-1','mock-item-1.3')",
  'ItemMacro.runMacro(`mock-actor-1`,`mock-item-1.3`)',
  'ItemMacro.runMacro("mock-actor-1",`mock-item-1.3`)',

  // Comment: // HotbarUses5e: ActorID="X" ItemID="Y"
  'doSomething();//HotbarUses5e:ActorID="mock-actor-1"ItemID="mock-item-1.3"\ndoSomething();',
  ' // HotbarUses5e : ActorID = "mock-actor-1" ItemID = "mock-item-1.3" \ndoSomething();',
  "// HotbarUses5e: ActorID='mock-actor-1' ItemID='mock-item-1.3'\ndoSomething();",
  '// HotbarUses5e: ActorID=`mock-actor-1` ItemID=`mock-item-1.3`\ndoSomething();',
  '// HotbarUses5e: ActorID="mock-actor-1" ItemID=`mock-item-1.3`\ndoSomething();',

  // Comment: // HotbarUses5e: ItemName="Y"
  'doSomething();//HotbarUses5e:ItemName="Throwing Dagger"\ndoSomething();',
  'doSomething();\n// HotbarUses5e : ItemName = "Throwing Dagger" \ndoSomething();',
  "// HotbarUses5e: ItemName='Throwing Dagger'\ndoSomething();",
  '// HotbarUses5e: ItemName=`Throwing Dagger`\ndoSomething();',

  // Comment: // HotbarUses5e: ActorName="X" ItemName="Y"
  'doSomething();//HotbarUses5e:ActorName="Alice"ItemName="Throwing Dagger"\ndoSomething();',
  'doSomething();\n// HotbarUses5e : ActorName = "Alice" ItemName = "Throwing Dagger" \ndoSomething();',
  "// HotbarUses5e: ActorName='Alice' ItemName='Throwing Dagger'\ndoSomething();",
  '// HotbarUses5e: ActorName=`Alice` ItemName=`Throwing Dagger`\ndoSomething();',
  '// HotbarUses5e: ActorName="Alice" ItemName=`Throwing Dagger`\ndoSomething();',

  // Comment: // HotbarUses5e: ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUses5e:ItemName="Throwing Dagger"ItemType="weapon"\ndoSomething();',
  'doSomething();\n// HotbarUses5e : ItemName = "Throwing Dagger" ItemType = "weapon" \ndoSomething();',
  "// HotbarUses5e: ItemName='Throwing Dagger' ItemType='weapon'\ndoSomething();",
  '// HotbarUses5e: ItemName=`Throwing Dagger` ItemType=`weapon`\ndoSomething();',
  '// HotbarUses5e: ItemName=`Throwing Dagger` ItemType="weapon"\ndoSomething();',

  // Comment: // HotbarUses5e: ActorName="X" ItemName="Y" ItemType="Z"
  'doSomething();//HotbarUses5e:ActorName="Alice"ItemName="Throwing Dagger"ItemType="weapon"\ndoSomething();',
  'doSomething();\n// HotbarUses5e : ActorName = "Alice" ItemName = "Throwing Dagger" ItemType = "weapon" \ndoSomething();',
  "// HotbarUses5e: ActorName='Alice' ItemName='Throwing Dagger' ItemType='weapon'\ndoSomething();",
  '// HotbarUses5e: ActorName=`Alice` ItemName=`Throwing Dagger` ItemType=`weapon`\ndoSomething();',
  '// HotbarUses5e: ActorName=\'Alice\' ItemName=`Throwing Dagger` ItemType="weapon"\ndoSomething();',

  // Comment: // HotbarUsesGeneric
  '// HotbarUsesGeneric\n// ActorID=mock-actor-1\n// ItemName=Throwing Dagger\n// Available=system.quantity\ndoSomething();',
])('command=%j', async (command) => {
  const actual = await calculateUses(command);

  expect(actual).toEqual({
    available: 3,
    showZeroUses: true,
  });
});
