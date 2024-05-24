const getActorBySpeaker = () => {
  const speaker = ChatMessage.getSpeaker();
  let actor: Actor | undefined;
  if (speaker.token) {
    actor = game.actors.tokens[speaker.token];
  }
  if (speaker.actor && !actor) {
    actor = game.actors.get(speaker.actor);
  }
  return actor;
};

const getActorByID = (actorID: string) => {
  const token = game.canvas?.tokens?.placeables.find(({ actor }) => actor?.id === actorID);
  if (token) {
    return token.actor;
  }
  return game.actors.get(actorID);
};

const getActorByName = (actorName: string) => {
  const token = game.canvas?.tokens?.placeables.find(({ actor }) => actor?.name === actorName);
  if (token) {
    return token.actor;
  }
  return game.actors.find((actor) => actor.name === actorName);
};

const getActor = ({ actorID, actorName }: { actorID: string | null; actorName: string | null }) => {
  let actor: Actor | undefined;
  if (actorID) {
    actor = getActorByID(actorID);
  } else if (actorName) {
    actor = getActorByName(actorName);
  } else {
    actor = getActorBySpeaker();
  }
  return actor;
};

export default getActor;
