const CSS_PREFIX = 'illandril-hotbar-uses--';
const CSS_COUNTER = CSS_PREFIX + 'counter';
const CSS_HAS_USES = CSS_PREFIX + 'hasUses';
const CSS_ZERO_USES = CSS_PREFIX + 'zeroUses';

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

function getItem(actor, itemName) {
  const items = actor.items.filter((i) => i.name === itemName);
  return items.length === 0 ? null : items[0];
}

function calculateUses(actor, macro) {
  const itemName = getItemNameForMacro(macro);
  if (!itemName) {
    // Not an item macro, assume infinite uses.
    return null;
  }
  if (!actor) {
    // It's an item, but there's no actor, so it can't be used.
    return 0;
  }
  const item = getItem(actor, itemName);
  if (!item) {
    // Actor doesn't have the item, so it can't be used
    return 0;
  }
  if (item.data.type === 'feat') {
    return calculateFeatUses(item);
  } else if (item.data.type === 'consumable') {
    return calculateConsumableUses(item);
  } else if (item.data.type === 'spell') {
    return calculateSpellUses(actor, item);
  } else {
    const consume = item.data.data.consume;
    if (consume && consume.target) {
      return calculateConsumeUses(consume);
    }
  }
  // Don't know how to calculate uses, assume infinite
  return null;
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

function calculateSpellUses(actor, item) {
  let slots;
  const preparationMode = item.data.data.preparation.mode;
  if (preparationMode === 'pact') {
    slots = actor.data.data.spells['pact'].value;
  } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
    if (item.hasLimitedUses) {
      slots = item.data.data.uses.value;
    } else {
      slots = null;
    }
  } else {
    let level = item.data.data.level;
    if (level > 0) {
      slots = actor.data.data.spells['spell' + level].value;
    } else {
      slots = null;
    }
  }
  return slots;
}

function calculateConsumeUses(consume) {
  if (consume.type === 'attribute') {
    const attrs = consume.target.split('.');
    let value = actor.data.data;
    attrs.forEach((attr) => {
      try {
        value = value[attr];
      } catch (err) {
        value = null;
      }
    });
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

function getItemNameForMacro(macro) {
  if (!macro) {
    return null;
  }
  const command = macro.data.command;
  const match = command.match(/game\.dnd5e\.rollItemMacro\("([^"]+)"\);/);
  if (!match) {
    return null;
  }
  return match[1];
}

function updateMacroSlot(slot, uses) {
  const hotbarElem = ui.hotbar.element[0];
  const slotElem = hotbarElem.querySelector('[data-slot="' + slot + '"]');
  let usesDisplay = slotElem.querySelector('.' + CSS_COUNTER);
  if (!usesDisplay) {
    usesDisplay = document.createElement('span');
    usesDisplay.classList.add(CSS_COUNTER);
    slotElem.appendChild(usesDisplay);
  }
  usesDisplay.innerText = uses;
  if (uses === null) {
    slotElem.classList.remove(CSS_HAS_USES);
  } else {
    slotElem.classList.add(CSS_HAS_USES);
    if (uses === 0) {
      usesDisplay.classList.add(CSS_ZERO_USES);
    } else {
      usesDisplay.classList.remove(CSS_ZERO_USES);
    }
  }
}

function renderHotbarIfHasItemMacro() {
  const itemHasShownMacro = ui.hotbar.macros.some((macroSlot) => {
    const macroItemName = getItemNameForMacro(macroSlot.macro);
    return macroItemName !== null;
  });
  if (itemHasShownMacro) {
    ui.hotbar.render();
  }
}

Hooks.on('updateOwnedItem', renderHotbarIfHasItemMacro);
Hooks.on('updateActor', renderHotbarIfHasItemMacro);
Hooks.on('controlToken', renderHotbarIfHasItemMacro);

Hooks.on('renderHotbar', (hotbar, html, options) => {
  const actor = getActor();
  options.macros.forEach((macroSlot) => {
    updateMacroSlot(macroSlot.slot, calculateUses(actor, macroSlot.macro));
  });
});
