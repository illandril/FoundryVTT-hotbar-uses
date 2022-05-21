import ItemSystem from './item-system.js';

const SYSTEM_ID = 'dnd5e';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Legacy dnd5e system Roll Item macro
  /^\s*game\s*\.\s*dnd5e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // Standard dnd5e system Roll Item macro
  /^\s*game\s*\.\s*dnd5e\s*\.macros\s*\.\s*rollItem\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // MinorQOL.doRoll
  /MinorQOL\.doRoll\(event, "(?<itemName>[^"]+)", {type: "(?<itemType>[^"]+)".*}\);?/,

  // BetterRolls.quickRoll(itemName)
  /^\s*BetterRolls\s*\.\s*quickRoll\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // BetterRolls.vanillaRoll(actorId, itemId)
  // BetterRolls.quickRollById(actorId, itemId)
  /^\s*BetterRolls\s*\.\s*(vanillaRoll|quickRollById)\s*\(\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*\)\s*;?\s*$/,

  // BetterRolls.quickRollByName(actorName, itemName)
  /^\s*BetterRolls\s*\.\s*quickRollByName\s*\(\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*\)\s*;?\s*$/,

  // BetterRolls 1.5.0 macros
  /^const actorId = "(?<actorID>.+)";\nconst itemId = "(?<itemID>.+)";\nconst actorToRoll = [^\n]*;\nconst itemToRoll = actorToRoll\?\.items\.get\(itemId\);/is,

  // ItemMacro.runMacro(actorId, itemId)
  /^\s*ItemMacro\s*\.\s*runMacro\s*\(\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUses5e: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUses5e:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUses5e: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUses5e:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*(\n.*)?$/is,
  /^(.*\n)?\s*\/\/\s*HotbarUses5e:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(\n.*)?$/is,
];

class DnD5eItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  async calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new DnD5eItemSystem();

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
  } else if (itemType === 'consumable' || itemType === 'loot') {
    return {
      available: itemData.quantity,
    };
  } else if (itemType === 'spell') {
    return calculateSpellUses(item);
  } else if (itemType === 'weapon') {
    return calculateWeaponUses(itemData);
  }
  return null;
}

function calculateConsumeUses(actor, consume) {
  let available = null;
  let maximum = null;
  if (consume.type === 'attribute') {
    const value = getProperty(actor.data.data, consume.target);
    if (typeof value === 'number') {
      available = value;
    } else {
      available = 0;
    }
  } else if (consume.type === 'ammo' || consume.type === 'material') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      available = targetItem.data.data.quantity;
    } else {
      available = 0;
    }
  } else if (consume.type === 'charges') {
    const targetItem = actor.items.get(consume.target);
    if (targetItem) {
      ({ available, maximum } = calculateLimitedUses(targetItem.data.data));
    } else {
      available = 0;
    }
  }
  if (available !== null) {
    if (consume.amount > 1) {
      available = Math.floor(available / consume.amount);
      if (maximum !== null) {
        maximum = Math.floor(maximum / consume.amount);
      }
    }
    return { available, maximum, isAmmunition: true };
  }
  return null;
}

function calculateLimitedUses(itemData) {
  let available = itemData.uses.value;
  let maximum = itemData.uses.max;
  const quantity = itemData.quantity;
  if (quantity) {
    available = available + (quantity - 1) * maximum;
    maximum = maximum * quantity;
  }
  return { available, maximum };
}

function calculateFeatUses(itemData) {
  if (itemData.recharge && itemData.recharge.value) {
    return { available: itemData.recharge.charged ? 1 : 0, maximum: 1 };
  }
  return null;
}

function calculateSpellUses(item) {
  const itemData = item.data.data;
  const actorData = item.actor.data.data;
  let available = null;
  let maximum = null;
  const preparationMode = itemData.preparation.mode;
  if (preparationMode === 'pact') {
    available = actorData.spells['pact'].value;
    maximum = actorData.spells['pact'].max;
  } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
    // None
  } else {
    let level = itemData.level;
    if (level > 0) {
      available = actorData.spells['spell' + level].value;
      maximum = actorData.spells['spell' + level].max;
    }
  }
  if (available === null) {
    return null;
  } else {
    return { available, maximum };
  }
}

function calculateWeaponUses(itemData) {
  // If the weapon is a thrown weapon, but not a returning weapon, show quantity
  if (itemData.properties.thr && !itemData.properties.ret) {
    return { available: itemData.quantity, maximum: null };
  }
  return null;
}
