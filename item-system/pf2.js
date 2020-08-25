const MACRO_ITEM_NAME_REGEX = [/game\.pf2e\.rollItemMacro\("([^"]+)"\);/];

function getItemIDForCommand(command) {
  if (command) {
    for (let i = 0; i < MACRO_ITEM_NAME_REGEX.length; i++) {
      const match = command.match(MACRO_ITEM_NAME_REGEX[i]);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

function getActor() {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) {
    actor = game.actors.tokens[speaker.token];
  }
  if (!actor) {
    actor = game.actors.get(speaker.actor);
  }
  return actor;
}

export const canCalculateUses = (command) => getItemIDForCommand(command) !== null;

export const calculateUses = (command) => {
  const itemID = getItemIDForCommand(command);
  if (!itemID) {
    // Not an item command, assume infinite uses.
    return null;
  }
  const actor = getActor();
  if (!actor) {
    // It's an item, but there's no actor, so it can't be used.
    return 0;
  }
  const item = actor.items.find((i) => i._id === itemID);
  if (!item) {
    return 0;
  }
  // TODO: Deal with charges and other data types
  if (item.type === 'consumable') {
    return item.data.data.quantity ? item.data.data.quantity.value : null;
  }
  return null;
};
