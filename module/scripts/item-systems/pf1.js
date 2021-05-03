import ItemSystem from './item-system.js';

const SYSTEM_ID = 'pf1';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf1 system Roll Item macro
  /^\s*game\s*\.\s*pf1\s*\.\s*rollItemMacro\s*\([\s\S]*itemId:\s*(?<q1>["'`])(?<itemID>.+)\k<q1>[\s\S]*actorId:\s*(?<q2>["'`])(?<actorID>.+)\k<q2>/,

  // Standard pf1 system Roll Item macro, but reversed itemID/actorID order
  /^\s*game\s*\.\s*pf1\s*\.\s*rollItemMacro\s*\([\s\S]*actorId:\s*(?<q2>["'`])(?<actorID>.+)\k<q2>[\s\S]*itemId:\s*(?<q1>["'`])(?<itemID>.+)\k<q1>/,

  // Comment: // HotbarUsesPF1: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF1:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUsesPF1: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF1:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*)?(\n.*)?$/is,
];

class PF1ItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  async calculateUsesForItem(item) {
    return await calculateUsesForItem(item);
  }
}
export default new PF1ItemSystem();

async function calculateUsesForItem(item) {
  if (item.type === 'spell') {
    return await calculateSpellUses(item);
  }
  if (item.hasAction && item.type === 'attack') {
    return await calculateAttackUses(item);
  }
  return await calculateChargeUses(item);
}

async function calculateSpellUses(item) {
  if (item.getSpellUses) {
    let available = item.getSpellUses();
    if (available === Number.POSITIVE_INFINITY) {
      return null;
    }
    let maximum = item.getSpellUses(true);
    if (item.chargeCost > 1) {
      available = Math.floor(available / item.chargeCost);
      maximum = Math.floor(maximum / item.chargeCost);
    }
    return { available, maximum };
  }
  return null;
}

async function calculateAttackUses(item) {
  const ammoLinks = await item.getLinkedItems('ammunition', true);
  if (ammoLinks) {
    let minAmmo;
    for (let ammo of ammoLinks) {
      if (minAmmo == null) {
        minAmmo = ammo.item.charges;
      } else {
        minAmmo = Math.min(minAmmo, ammo.item.charges);
      }
    }
    return {
      available: minAmmo,
      isAmmunition: true,
    };
  }
  return null;
}

async function calculateChargeUses(item) {
  let available = item.charges || 0;
  let maximum = item.maxCharges || 0;
  if (item.chargeCost > 1) {
    available = Math.floor(available / item.chargeCost);
    maximum = Math.floor(maximum / item.chargeCost);
  }
  return { available, maximum };
}
