const MACRO_ITEM_NAME_REGEX = [
  /game\.dnd5e\.rollItemMacro\("([^"]+)"\);/,
  /MinorQOL\.doRoll\(event, "([^"]+)", {type: "([^"]+)".*}\);/,
];

function getItemLookupDetailsForCommand(command) {
  if (command) {
    for (let i = 0; i < MACRO_ITEM_NAME_REGEX.length; i++) {
      const match = command.match(MACRO_ITEM_NAME_REGEX[i]);
      if (match) {
        if (match.length > 2) {
          return { name: match[1], type: match[2] };
        } else if (match.length === 2) {
          return { name: match[1], type: null };
        }
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

function getItems(actor, itemLookupDetails) {
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
  let uses = null;
  if (item.data.type === 'feat') {
    uses = calculateFeatUses(item);
  } else if (item.data.type === 'consumable') {
    uses = calculateConsumableUses(item);
  } else if (item.data.type === 'spell') {
    uses = calculateSpellUses(item);
  } else {
    const consume = item.data.data.consume;
    if (consume && consume.target) {
      uses = calculateConsumeUses(item.actor, consume);
    }
  }
  return uses;
}

function calculateFeatUses(item) {
  if (item.hasLimitedUses) {
    return item.data.data.uses.value;
  } else {
    return null;
  }
}

function calculateConsumableUses(item) {
  let uses = 1;
  let maxUses = 1;
  if (item.hasLimitedUses) {
    uses = item.data.data.uses.value;
    maxUses = item.data.data.uses.max;
  }
  const quantity = item.data.data.quantity;
  if (quantity) {
    return uses + (quantity - 1) * maxUses;
  } else {
    return uses;
  }
}

function calculateSpellUses(item) {
  let slots;
  const preparationMode = item.data.data.preparation.mode;
  if (preparationMode === 'pact') {
    slots = item.actor.data.data.spells['pact'].value;
  } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
    if (item.hasLimitedUses) {
      slots = item.data.data.uses.value;
    } else {
      slots = null;
    }
  } else {
    let level = item.data.data.level;
    if (level > 0) {
      slots = item.actor.data.data.spells['spell' + level].value;
    } else {
      slots = null;
    }
  }
  return slots;
}

function calculateConsumeUses(actor, consume) {
  if (consume.type === 'attribute') {
    const value = getProperty(actor.data.data, consume.target);
    if (typeof value === 'number') {
      return value;
    }
  } else if (consume.type === 'ammo' || consume.type === 'material') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      return targetItem.data.data.quantity;
    } else {
      return 0;
    }
  } else if (consume.type === 'charges') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      let uses = 1;
      let maxUses = 1;
      if (targetItem.data.hasUses) {
        uses = targetItem.data.data.uses.value;
        maxUses = targetItem.data.data.uses.max;
      }
      const quantity = targetItem.data.data.quantity;
      const remainingUses = quantity ? uses + (quantity - 1) * maxUses : uses;
      return remainingUses;
    } else {
      return 0;
    }
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
  const actor = getActor();
  if (!actor) {
    // It's an item, but there's no actor, so it can't be used.
    return 0;
  }
  return calculateUsesForItems(getItems(actor, itemLookupDetails));
};
