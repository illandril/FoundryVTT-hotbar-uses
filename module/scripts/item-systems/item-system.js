const GENERIC_MACRO_REGEX_ARRAY = [
  /*
  Comment...

  // HotbarUsesGeneric
  // ActorID=AID
  // ActorName=AN
  // ItemID=IID
  // ItemName=IN
  // ItemType=IT
  // Uses=U
  // Consumed=C
  // Max=M

  All values except the HotbarUsesGeneric identifier are optional, but order is important
  */
  /^(.*\n)?\s*\/\/\s*(?<generic>HotbarUsesGeneric)\s*(\n\s*\/\/\s*ActorID\s*=\s*(?<actorID>[^\n]+))?(\n\s*\/\/\s*ActorName\s*=\s*(?<actorName>[^\n]+))?(\n\s*\/\/\s*ItemID\s*=\s*(?<itemID>[^\n]+))?(\n\s*\/\/\s*ItemName\s*=\s*(?<itemName>[^\n]+))?(\n\s*\/\/\s*ItemType\s*=\s*(?<itemType>[^\n]+))?(\n\s*\/\/\s*Available\s*=\s*(?<available>[^\n]+))?(\n\s*\/\/\s*Consumed\s*=\s*(?<consumed>[^\n]+))?(\n\s*\/\/\s*Max\s*=\s*(?<max>[^\n]+))?(\n.*)?$/is,
];

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
  let token = canvas.tokens.placeables.find((token) => token.actor && token.actor.id === actorID);
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
  return CONFIG.illandril.hotbarUses.macros[systemID].concat(GENERIC_MACRO_REGEX_ARRAY);
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
          generic: !!match.groups.generic,
          available: match.groups.available || null,
          consumed: match.groups.consumed || null,
          max: match.groups.max || null,
          actionIndex: match.groups.actionIndex || null,
          actionName: match.groups.actionName || null,
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
  if (itemLookupDetails.name) {
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
  }
  if (itemLookupDetails.actionIndex !== null) {
    const actionIndex = parseInt(itemLookupDetails.actionIndex, 10);
    if (!isNaN(actionIndex) && actionIndex >= 0) {
      const actions = getProperty(actor, 'data.data.actions');
      if (actions) {
        const action = actions[actionIndex];
        if (action && action.name === itemLookupDetails.actionName) {
          return [action];
        }
      }
    }
    return [];
  }
  return null;
};

const genericLookup = (data, key) => {
  if (!key) {
    return null;
  }
  const numeric = parseInt(key, 10);
  if (!isNaN(numeric)) {
    return numeric;
  }
  const parsed = parseInt(getProperty(data, key), 10);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return null;
};

const add = (current, addition) => {
  if (typeof addition === 'number') {
    if (current === null) {
      return addition;
    }
    return current + addition;
  }
  return current;
};

const genericCalculateUses = (actor, items, itemLookupDetails) => {
  if (items) {
    let consumed = null;
    let available = null;
    let maximum = null;
    for (let item of items) {
      const itemAvailable = genericLookup(item.data, itemLookupDetails.available);
      const itemConsumed = genericLookup(item.data, itemLookupDetails.consumed);
      const itemMaximum = genericLookup(item.data, itemLookupDetails.max);
      available = add(consumed, itemAvailable);
      consumed = add(consumed, itemConsumed);
      maximum = add(consumed, itemMaximum);
    }
    return {
      available,
      consumed,
      maximum,
    };
  } else {
    const available = genericLookup(actor.data, itemLookupDetails.available);
    const consumed = genericLookup(actor.data, itemLookupDetails.consumed);
    const maximum = genericLookup(actor.data, itemLookupDetails.max);
    return {
      showZeroUses: available !== null,
      available,
      consumed,
      maximum,
    };
  }
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
      return { available: 0 };
    }
    const items = getItems(actor, itemLookupDetails);
    if (itemLookupDetails.generic) {
      return genericCalculateUses(actor, items, itemLookupDetails);
    }
    return await this.calculateUsesForItems(items);
  }

  async calculateUsesForItems(items) {
    if (!items || items.length === 0) {
      return { available: 0 };
    }
    let uses = {
      showZeroUses: true,
    };
    for (let item of items) {
      let thisItemUses = await this.calculateUsesForItem(item);
      if (thisItemUses === null) {
        uses = null;
        break;
      }
      if (thisItemUses.isAmmunition) {
        // If there are multiple items of the same name, chances are they use the same ammunition
        // Adding the uses together from multiple items would count the ammunition multiple times
        uses = thisItemUses;
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
