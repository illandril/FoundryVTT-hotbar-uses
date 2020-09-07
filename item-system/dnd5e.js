mergeObject(CONFIG, {
  illandril: {
    hotbarUses: {
      macros: {
        dnd5e: [
          // Standard dnd5e system Roll Item macro
          /^\s*game\s*\.\s*dnd5e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

          // MinorQOL.doRoll
          /MinorQOL\.doRoll\(event, "(?<itemName>[^"]+)", {type: "(?<itemType>[^"]+)".*}\);?/,

          // BetterRolls.quickRoll(itemName)
          /^\s*BetterRolls\s*\.\s*quickRoll\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

          // BetterRolls.vanillaRoll(actorId, itemId)
          // BetterRolls.quickRollById(actorId, itemId)
          /^\s*BetterRolls\s*\.\s*(vanillaRoll|quickRollById)\s*\(\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*\)\s*;?\s*$/,

          // BetterRolls.quickRollByName(actorName, itemName)
          /^\s*BetterRolls\s*\.\s*quickRollByName\s*\(\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*\)\s*;?\s*$/,
        ],
      },
    },
  },
});

function getItemLookupDetailsForCommand(command) {
  let results = null;
  if (command) {
    CONFIG.illandril.hotbarUses.macros.dnd5e.some((regex) => {
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
    uses = uses + thisItemUses;
    return false;
  });
  return uses;
}

function calculateUsesForItem(item) {
  const itemData = item.data.data;
  const consume = itemData.consume;
  if (consume && consume.target) {
    return calculateConsumeUses(item.actor, consume);
  }
  const uses = itemData.uses;
  if (uses && (uses.max > 0 || uses.value > 0)) {
    return calculateLimitedUses(itemData);
  }

  const itemType = item.data.type;
  if (itemType === 'feat') {
    return calculateFeatUses(itemData);
  } else if (itemType === 'consumable') {
    return itemData.quantity;
  } else if (itemType === 'spell') {
    return calculateSpellUses(item);
  } else if (itemType === 'weapon') {
    return calculateWeaponUses(itemData);
  }
  return null;
}


function calculateConsumeUses(actor, consume) {
  let consumeRemaining = null;
  if (consume.type === 'attribute') {
    const value = getProperty(actor.data.data, consume.target);
    if (typeof value === 'number') {
      consumeRemaining = value;
    } else {
      consumeRemaining = 0;
    }
  } else if (consume.type === 'ammo' || consume.type === 'material') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      consumeRemaining = targetItem.data.data.quantity;
    } else {
      consumeRemaining = 0;
    }
  } else if (consume.type === 'charges') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      consumeRemaining = calculateLimitedUses(targetItem.data.data);
    } else {
      consumeRemaining = 0;
    }
  }
  if(consumeRemaining !== null) {
    if(consume.amount > 1) {
      return Math.floor(consumeRemaining / consume.amount);
    } else {
      return consumeRemaining;
    }
  }
  return null;
}

function calculateLimitedUses(itemData) {
  let uses = itemData.uses.value;
  let maxUses = itemData.uses.max;
  const quantity = itemData.quantity;
  if (quantity) {
    return uses + (quantity - 1) * maxUses;
  } else {
    return uses;
  }
}

function calculateFeatUses(itemData) {
  if (itemData.recharge && itemData.recharge.value) {
    return itemData.recharge.charged ? 1 : 0;
  }
  return null;
}

function calculateSpellUses(item) {
  const itemData = item.data.data;
  const actorData = item.actor.data.data;
  let slots;
  const preparationMode = itemData.preparation.mode;
  if (preparationMode === 'pact') {
    slots = actorData.spells['pact'].value;
  } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
    slots = null;
  } else {
    let level = itemData.level;
    if (level > 0) {
      slots = actorData.spells['spell' + level].value;
    } else {
      slots = null;
    }
  }
  return slots;
}

function calculateWeaponUses(itemData) {
  // If the weapon is a thrown weapon, but not a returning weapon, show quantity
  if (itemData.properties.thr && !itemData.properties.ret) {
    return itemData.quantity;
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
