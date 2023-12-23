import { AbstractOwnedEntry, OwnedMagicItem } from './magic-items-2';
import { calculateUses } from '.';

const mockModulesGet = jest.fn((id: string) => ({
  id,
  active: true,
} as Module));

beforeAll(() => {
  const actorID = 'mock-actor-id';
  const actors = new Map<string, Actor>();
  actors.set(actorID, {
    id: actorID,
  } as Actor);
  const miActors = new Map<string, ReturnType<typeof MagicItems.actor>>();

  const magicItems: OwnedMagicItem[] = [
    {
      name: 'Staff of Testing',
      charges: 18,
      uses: 10,
      chargesOnWholeItem: true,
      ownedEntries: [
        {
          name: 'Alarm',
          uses: 3,
          item: {
            consumption: '1',
          },
        } as AbstractOwnedEntry,
        {
          name: 'Aid',
          uses: 6,
          item: {
            consumption: '2',
          },
        } as AbstractOwnedEntry,
        {
          name: 'Blink',
          uses: 9,
          item: {
            consumption: 3,
          },
        } as AbstractOwnedEntry,
      ],
    },
    {
      name: 'Gnitset fo Ffats',
      charges: 8,
      uses: 7,
      chargesOnWholeItem: false,
      ownedEntries: [
        {
          name: 'Mrala',
          uses: 3,
          item: {
            consumption: '1',
          },
        } as AbstractOwnedEntry,
        {
          name: 'Dia',
          uses: 6,
          item: {
            consumption: '2',
          },
        } as AbstractOwnedEntry,
      ],
    },
  ];
  for (const magicItem of magicItems) {
    for (const entry of magicItem.ownedEntries) {
      (entry as { magicItem: OwnedMagicItem }).magicItem = magicItem;
    }
  }

  miActors.set('mock-actor-id', {
    items: magicItems,
  });

  jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
    actor: actorID,
  });
  jest.spyOn(game.actors, 'get').mockImplementation((id) => actors.get(id)!);
  jest.spyOn(game.modules, 'get').mockImplementation(mockModulesGet);

  (window as unknown as { MagicItems: typeof MagicItems }).MagicItems = {
    actor: (id: string) => miActors.get(id),
  };
});

describe('module is inactive', () => {
  beforeEach(() => {
    mockModulesGet.mockImplementation((id) => ({
      id,
      active: id !== 'magic-items-2',
    } as Module));
  });

  it('returns null for a command that would be a valid match', async () => {
    const actual = await calculateUses('MagicItems.roll("Staff of Testing","Alarm");');

    expect(actual).toEqual(null);
  });

  it('returns null for a command that would have no match', async () => {
    const actual = await calculateUses('MagicItems.roll("Missing","Item");');

    expect(actual).toEqual(null);
  });
});

describe('module is active', () => {
  beforeEach(() => {
    mockModulesGet.mockImplementation((id) => ({
      id,
      active: id === 'magic-items-2',
    } as Module));
  });

  it('returns 0 uses for a command that has no matching item', async () => {
    const actual = await calculateUses('MagicItems.roll("Ttaff of Sesting","Alarm");');

    expect(actual).toEqual({
      available: 0,
    });
  });

  it('returns 0 uses for a command that has a matching item but no matching ownedEntry', async () => {
    const actual = await calculateUses('MagicItems.roll("Staff of Testing","Mrala");');

    expect(actual).toEqual({
      available: 0,
    });
  });

  it('returns correct value for Staff of Testing: Alarm', async () => {
    const actual = await calculateUses('MagicItems.roll("Staff of Testing","Alarm");');

    expect(actual).toEqual({
      available: 10,
      maximum: 18,
    });
  });

  it('returns correct value for Staff of Testing: Aid', async () => {
    const actual = await calculateUses('MagicItems.roll("Staff of Testing","Aid");');

    expect(actual).toEqual({
      available: 5,
      maximum: 9,
    });
  });

  it('returns correct value for Staff of Testing: Blink', async () => {
    const actual = await calculateUses('MagicItems.roll("Staff of Testing","Blink");');

    expect(actual).toEqual({
      available: 3,
      maximum: 6,
    });
  });

  it('returns correct value for Gnitset fo Ffats: Mrala', async () => {
    const actual = await calculateUses('MagicItems.roll("Gnitset fo Ffats","Mrala");');

    expect(actual).toEqual({
      available: 3,
      maximum: 8,
    });
  });

  it('returns correct value for Gnitset fo Ffats: Dia', async () => {
    const actual = await calculateUses('MagicItems.roll("Gnitset fo Ffats","Dia");');

    expect(actual).toEqual({
      available: 3,
      maximum: 4,
    });
  });
});
