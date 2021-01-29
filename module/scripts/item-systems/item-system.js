const getActorBySpeaker = () => {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) {
    actor = game.actors.tokens[speaker.token];
  }
  if (!actor) {
    actor = game.actors.get(speaker.actor);
  }
  return actor;
};

const getActorByID = (actorID) => {
  let token = canvas.tokens.placeables.find((token) => token.actor && token.actor._id === actorID);
  if (token) {
    return token.actor;
  }
  return game.actors.get(actorID);
};

const getActorByName = (actorName) => {
  let token = canvas.tokens.placeables.find(
    (token) => token.actor && token.actor.data.name === actorName
  );
  if (token) {
    return token.actor;
  }
  return game.actors.find((actor) => actor.name === actorName);
};

export const getActor = ({ actorID = null, actorName = null } = {}) => {
  let actor;
  if (actorID) {
    actor = getActorByID(actorID);
  } else if (actorName) {
    actor = getActorByName(actorName);
  } else {
    actor = getActorBySpeaker();
  }
  return actor;
};

const setDefaultMacroRegexArray = (systemID, macroRegexArray) => {
  const macros = {};
  macros[systemID] = macroRegexArray;
  mergeObject(CONFIG, {
    illandril: {
      hotbarUses: {
        macros,
      },
    },
  });
};

const getMacroRegexArray = (systemID) => {
  return CONFIG.illandril.hotbarUses.macros[systemID];
};

const getItemLookupDetailsForCommand = (systemID, command) => {
  let results = null;
  if (command) {
    getMacroRegexArray(systemID).some((regex) => {
      const match = command.match(regex);
      if (match) {
        results = {
          name: match.groups.itemName || null,
          type: match.groups.itemType || null,
          id: match.groups.itemID || null,
          actorID: match.groups.actorID || null,
          actorName: match.groups.actorName || null,
          magicitemsModuleName: match.groups.magicitemsModuleName || null,
        };
        return true;
      }
    });
  }
  return results;
};

const getItems = (actor, itemLookupDetails) => {
  if (itemLookupDetails.id) {
    const item = actor.items.get(itemLookupDetails.id);
    return item ? [item] : [];
  }
  let firstType = itemLookupDetails.type;
  return actor.items.filter((item) => {
    if (item.name !== itemLookupDetails.name) {
      return false;
    }
    if (firstType === null) {
      firstType = item.data.type;
      return true;
    } else {
      return item.data.type === firstType;
    }
  });
};

export default class ItemSystem {
  constructor(systemID, macroRegexArray) {
    this._systemID = systemID;
    setDefaultMacroRegexArray(systemID, macroRegexArray);
  }

  canCalculateUses(command) {
    return getItemLookupDetailsForCommand(this._systemID, command) !== null;
  }

  async calculateUses(command) {
    const itemLookupDetails = getItemLookupDetailsForCommand(this._systemID, command);
    if (!itemLookupDetails) {
      // Not an item command, assume infinite uses.
      return null;
    }
    const actor = getActor(itemLookupDetails);
    if (!actor) {
      // It's an item, but there's no actor, so it can't be used.
      return 0;
    }
    return await this.calculateUsesForItems(getItems(actor, itemLookupDetails));
  }

  async calculateUsesForItems(items) {
    if (items.length === 0) {
      return { available: 0 };
    }
    let uses = {};
    for (let item of items) {
      let thisItemUses = await this.calculateUsesForItem(item);
      if (thisItemUses === null) {
        uses = null;
        break;
      }
      if (typeof thisItemUses.available === 'number') {
        if (typeof uses.available === 'number') {
          uses.available += thisItemUses.available;
        } else {
          uses.available = thisItemUses.available;
        }
      }
      if (typeof thisItemUses.consumed === 'number') {
        if (typeof uses.consumed === 'number') {
          uses.consumed += thisItemUses.consumed;
        } else {
          uses.consumed = thisItemUses.consumed;
        }
      }
      if (typeof thisItemUses.maximum === 'number') {
        if (typeof uses.maximum === 'number') {
          uses.maximum += thisItemUses.maximum;
        } else {
          uses.maximum = thisItemUses.maximum;
        }
      }
    }
    return uses;
  }

  async calculateUsesForItem(item) {
    throw new Error('ItemSystem for ' + this._systemID + ' did not implement calculateUsesForItem');
  }
}
