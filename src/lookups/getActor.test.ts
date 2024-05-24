import getActor from './getActor';

const actor1 = {
  id: 'mock-actor-1',
  name: 'Alice',
} as Actor;
const actor2 = {
  id: 'mock-actor-2',
  name: 'Bob',
} as Actor;
const actor3 = {
  id: 'mock-actor-3',
  name: 'Charlie',
} as Actor;

const tokenActor1 = {
  id: 'mock-token-actor-1',
  name: 'Dave',
} as Actor;
const tokenActor2 = {
  id: 'mock-token-actor-2',
  name: 'Eve',
} as Actor;
const token1 = {
  document: {
    id: 'mock-token-1',
  },
  actor: tokenActor1,
} as Token;
const token2 = {
  document: {
    id: 'mock-token-2',
  },
  actor: tokenActor2,
} as Token;

beforeAll(() => {
  const actors = new Map<string, Actor>();
  actors.set(actor1.id, actor1);
  actors.set(actor2.id, actor2);
  actors.set(actor3.id, actor3);

  jest.spyOn(game.actors, 'get').mockImplementation((id) => actors.get(id)!);
  jest
    .spyOn(game.actors, 'find')
    .mockImplementation((predicate) =>
      [...actors.values()].find((value, index) =>
        predicate(value, index, {} as foundry.utils.Collection<string, Actor>),
      ),
    );

  jest.replaceProperty(game.canvas.tokens!, 'placeables', [token1, token2]);
  game.actors.tokens[token1.document.id] = tokenActor1;
  game.actors.tokens[token2.document.id] = tokenActor2;
});

it.each([actor1, actor2, actor3])('returns the speaker if no ID or name is provided (actor, $id)', (expected) => {
  jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
    actor: expected.id,
  });
  const actor = getActor({
    actorID: null,
    actorName: null,
  });
  expect(actor).toBe(expected);
});

it.each([token1, token2])('returns the speaker if no ID or name is provided (token, $document.id)', (token) => {
  jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
    token: token.document.id,
  });
  const actor = getActor({
    actorID: null,
    actorName: null,
  });
  expect(actor).toBe(token.actor);
});

it.each([actor1, actor2, actor3])('returns the actor for matching ID if provided (actor, $id)', (expected) => {
  const actor = getActor({
    actorID: expected.id,
    actorName: null,
  });
  expect(actor).toBe(expected);
});

it.each([token1, token2])('returns the actor for matching ID if provided (token, $actor.id)', (token) => {
  const actor = getActor({
    actorID: token.actor.id,
    actorName: null,
  });
  expect(actor).toBe(token.actor);
});

it.each([actor1, actor2, actor3])('returns the actor for matching name if provided (actor, $name)', (expected) => {
  const actor = getActor({
    actorID: null,
    actorName: expected.name,
  });
  expect(actor).toBe(expected);
});

it.each([token1, token2])('returns the actor for matching name if provided (token, $actor.name)', (token) => {
  const actor = getActor({
    actorID: null,
    actorName: token.actor.name,
  });
  expect(actor).toBe(token.actor);
});

it('returns the actor for the matching ID even if a non-matching name is provided', () => {
  const actor = getActor({
    actorID: actor2.id,
    actorName: actor1.name,
  });
  expect(actor).toBe(actor2);
});

it('returns undefined if no matching ID', () => {
  const actor = getActor({
    actorID: 'mock-actor-4',
    actorName: null,
  });
  expect(actor).toBeUndefined();
});

it('returns undefined if no matching name', () => {
  const actor = getActor({
    actorID: null,
    actorName: 'Mallory',
  });
  expect(actor).toBeUndefined();
});

it.each(['mock-actor-4', undefined])(
  'returns undefined if no matching speaker and no provided id or name (%j)',
  (id) => {
    jest.spyOn(ChatMessage, 'getSpeaker').mockReturnValue({
      actor: id,
    });

    const actor = getActor({
      actorID: null,
      actorName: null,
    });
    expect(actor).toBeUndefined();
  },
);
