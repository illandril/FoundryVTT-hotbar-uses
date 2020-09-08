// Support for the Shadow of the Demon Lord system was initially added by Xacus
mergeObject(CONFIG, {
  illandril: {
    hotbarUses: {
      macros: {
        demonlord: [
          // Roll Talent macro
          /^\s*game\s*\.\s*demonlord\s*\.\s*rollTalentMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

          // Roll Spell macro
          /^\s*game\s*\.\s*demonlord\s*\.\s*rollSpellMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,
        ],
      },
    },
  },
});

function getItemLookupDetailsForCommand(command) {
  let results = null;
  if (command) {
    CONFIG.illandril.hotbarUses.macros.demonlord.some((regex) => {
      const match = command.match(regex);
      if (match) {
        results = {
          name: match.groups.itemName || null,
          type: match.groups.itemType || null,
          id: match.groups.itemID || null,
          actorID: match.groups.actorID || null,
          actorName: match.groups.actorName || null,
        };

        return true;
      }
    });
  }
  return results;
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

function getActorByID(actorID) {
  let token = canvas.tokens.placeables.find((token) => token.actor && token.actor._id === actorID);
  if (token) {
    return token.actor;
  }
  return game.actors.get(actorID);
}

function getActorByName(actorName) {
  let token = canvas.tokens.placeables.find(
    (token) => token.actor && token.actor.data.name === actorName
  );
  if (token) {
    return token.actor;
  }
  return game.actors.find((actor) => actor.name === actorName);
}

function getItems(actor, itemLookupDetails) {
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
}

function calculateUsesForItems(items) {
  let uses = 0;
  items.some((item) => {
    let thisItemUses = calculateUsesForItem(item);
    if (thisItemUses === null) {
      uses = null;
      return true;
    }
    uses = thisItemUses;
    return false;
  });
  return uses;
}

function calculateUsesForItem(item) {
  const itemData = item.data.data;
  const itemType = item.data.type;
  if (itemType === 'spell') {
    return calculateSpellUses(itemData);
  } else if (itemType === 'talent') {
    return calculateTalentUses(itemData);
  }
  return null;
}

function calculateTalentUses(item) {
  const uses = item.uses;
  if (uses && (uses.max > 0 || uses.value > 0)) {
    return uses.value + '/' + uses.max;
  }

  return null;
}

function calculateSpellUses(item) {
  const castings = item.castings;
  if (castings && (castings.max > 0 || castings.value > 0)) {
    return castings.value + '/' + castings.max;
  }

  return null;
}

export const canCalculateUses = (command) => getItemLookupDetailsForCommand(command) !== null;

export const calculateUses = (command) => {
  const itemLookupDetails = getItemLookupDetailsForCommand(command);
  if (!itemLookupDetails) {
    // Not an item command, assume infinite uses.
    return null;
  }
  let actor;
  if (itemLookupDetails.actorID) {
    actor = getActorByID(itemLookupDetails.actorID);
  } else if (itemLookupDetails.actorName) {
    actor = getActorByName(itemLookupDetails.actorName);
  } else {
    actor = getActor();
  }
  if (!actor) {
    // It's an item, but there's no actor, so it can't be used.
    return 0;
  }
  return calculateUsesForItems(getItems(actor, itemLookupDetails));
};
