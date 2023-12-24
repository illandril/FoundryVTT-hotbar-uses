import { calculateUses } from '..';
import module from '../../module';

beforeAll(async () => {
  jest.replaceProperty(game.system, 'id', 'some-unsupported-system');
  const warnSpy = jest.spyOn(module.logger, 'warn');
  warnSpy.mockImplementation(() => undefined);
  await calculateUses(null);
  expect(warnSpy).toHaveBeenCalledTimes(1);
  expect(warnSpy).toHaveBeenCalledWith('some-unsupported-system', 'is not supported - only HotbarUsesGeneric lookups will work. Go to the GitHub page for this module to learn more and/or to request support for this system: https://github.com/illandril/FoundryVTT-hotbar-uses');
  warnSpy.mockRestore();
});

describe('dnd5e system clone', () => {
  beforeAll(() => {
    const actor1Items = new Map<string, dnd5e.documents.Item5e>();
    const actor1 = {
      id: 'mock-actor-1',
      items: {
        get: (id) => actor1Items.get(id),
        find: (condition) => [...actor1Items.values()].find((value, index) => condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>)),
        filter: (condition) => [...actor1Items.values()].filter((value, index) => condition(value, index, {} as foundry.utils.Collection<string, dnd5e.documents.Item5e>)),
      },
    } as dnd5e.documents.Actor5e;
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

  it('returns null for something that would be valid if the system were dnd5e', async () => {
    const actual = await calculateUses('dnd5e.documents.macro.rollItem("Throwing Dagger")');

    expect(actual).toEqual(null);
  });

  it('returns value for HotbarUsesGeneric comment', async () => {
    const actual = await calculateUses('// HotbarUsesGeneric\n// ActorID=mock-actor-1\n// ItemName=Throwing Dagger\n// Available=system.quantity\ndoSomething();');

    expect(actual).toEqual({
      available: 3,
      showZeroUses: true,
    });
  });
});
