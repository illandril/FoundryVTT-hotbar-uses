import getNumber from '../../lookups/getNumber';
import ItemSystem from '../ItemSystem';

const SYSTEM_ID = 'dnd5e';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Legacy dnd5e system Roll Item macros
  /^\s*game\s*\.\s*dnd5e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,
  /^\s*game\s*\.\s*dnd5e\s*\.\s*macros\s*\.\s*rollItem\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,

  // Standard dnd5e system Roll Item macro
  /^\s*dnd5e\s*\.\s*documents\s*\.\s*macro\s*\.\s*rollItem\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,

  // MinorQOL.doRoll
  /MinorQOL\s*\.\s*doRoll\s*\(\s*event\s*,\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*,\s*(\{|\{.+,)\s*type\s*:\s*(?<qb>["'`])(?<itemType>.+?)\k<qb>\s*(,.*\}|\})\s*\)\s*;?/,

  // BetterRolls.quickRoll(itemName)
  /^\s*BetterRolls\s*\.\s*quickRoll\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,

  // BetterRolls.vanillaRoll(actorId, itemId)
  // BetterRolls.quickRollById(actorId, itemId)
  /^\s*BetterRolls\s*\.\s*(vanillaRoll|quickRollById)\s*\(\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*,\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*\)\s*;?\s*$/,

  // BetterRolls.quickRollByName(actorName, itemName)
  /^\s*BetterRolls\s*\.\s*quickRollByName\s*\(\s*(?<q>["'`])(?<actorName>.+?)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+?)\k<qb>\s*\)\s*;?\s*$/,

  // BetterRolls 1.5.0 macros
  /^const\s+actorId\s*=\s*"(?<actorID>.+?)"\s*;\s*const\s+itemId\s*=\s*"(?<itemID>.+?)"\s*;\s*const\s+actorToRoll\s*=.*const\s+itemToRoll\s*=\s*actorToRoll.*/is,

  // ItemMacro.runMacro(actorId, itemId)
  /^\s*ItemMacro\s*\.\s*runMacro\s*\(\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*,\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUses5e: ActorID="X" ItemID="Y"
  /\s*\/\/\s*HotbarUses5e\s*:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*(\n.*)?$/is,

  // Comment: // HotbarUses5e: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /\s*\/\/\s*HotbarUses5e\s*:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+?)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+?)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+?)\k<qc>\s*)?(\n.*)?$/is,
];

type Spell = dnd5e.documents.ItemSystemData.Spell;
type Weapon = dnd5e.documents.ItemSystemData.Weapon;
type Consumable = dnd5e.documents.ItemSystemData.Consumable;
type Loot = dnd5e.documents.ItemSystemData.Loot;
type ActivatedEffect = dnd5e.documents.ItemSystemData.ActivatedEffect;
type Feat = dnd5e.documents.ItemSystemData.Feat;

const calculateUsesForItem5e = (item: dnd5e.documents.Item5e) => {
  const itemData = item.system;
  const consume = (itemData as ActivatedEffect).consume;
  if (consume?.target) {
    return calculateConsumeUses(item.actor, consume);
  }
  const uses = (itemData as ActivatedEffect).uses;
  if (uses && typeof uses.max === 'number' && uses.value && (uses.max > 0 || uses.value > 0)) {
    return calculateLimitedUses(itemData, uses.value, uses.max);
  }

  const itemType = item.type;
  if (itemType === 'feat') {
    return calculateFeatUses(itemData);
  }
  if (itemType === 'consumable' || itemType === 'loot') {
    return {
      available: (itemData as Consumable | Loot).quantity,
    };
  }
  if (itemType === 'spell') {
    return calculateSpellUses(item, itemData);
  }
  if (itemType === 'weapon') {
    return calculateWeaponUses(itemData);
  }
  return null;
};
class DnD5eItemSystem extends ItemSystem<dnd5e.documents.Item5e> {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY, (item) => Promise.resolve(calculateUsesForItem5e(item)));
  }
}
export default new DnD5eItemSystem();

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Legacy
function calculateConsumeUses(actor: dnd5e.documents.Actor5e | null, consume: NonNullable<ActivatedEffect['consume']>) {
  let available: number | undefined = undefined;
  let maximum: number | undefined = undefined;
  if (consume.target) {
    if (consume.type === 'attribute') {
      const value = foundry.utils.getProperty(actor?.system, consume.target);
      if (typeof value === 'number') {
        available = value;
      } else {
        available = 0;
      }
    } else if (consume.type === 'ammo' || consume.type === 'material') {
      const targetItem = actor?.items.get(consume.target);
      if (targetItem && 'quantity' in targetItem.system && typeof targetItem.system.quantity === 'number') {
        available = targetItem.system.quantity;
      } else {
        available = 0;
      }
    } else if (consume.type === 'charges') {
      const targetItem = actor?.items.get(consume.target);
      if (targetItem) {
        ({ available, maximum } = calculateLimitedUses(
          targetItem.system,
          getNumber(targetItem, 'system.uses.value') || 0,
          getNumber(targetItem, 'system.uses.max') || 0,
        ));
      } else {
        available = 0;
      }
    }
  }
  if (available !== undefined) {
    if (consume.amount && consume.amount > 1) {
      available = Math.floor(available / consume.amount);
      if (maximum !== undefined) {
        maximum = Math.floor(maximum / consume.amount);
      }
    }
    return { available, maximum, isAmmunition: true };
  }
  return null;
}

function calculateLimitedUses(itemData: dnd5e.documents.ItemSystemData.Any, value: number, max: number) {
  let available = value;
  let maximum = max;
  if ('quantity' in itemData) {
    const quantity = itemData.quantity;
    if (quantity) {
      available = available + (quantity - 1) * maximum;
      maximum = maximum * quantity;
    }
  }
  return { available, maximum };
}

function calculateFeatUses(itemData: Feat) {
  if (itemData.recharge?.value) {
    return { available: itemData.recharge.charged ? 1 : 0, maximum: 1 };
  }
  return null;
}

function calculateSpellUses(item: dnd5e.documents.Item5e, itemData: Spell) {
  const actorData = item.actor?.system;
  if (!actorData || !('spells' in actorData)) {
    return null;
  }
  let available: number | undefined;
  let maximum: number | undefined;
  const preparationMode = itemData.preparation?.mode;
  if (preparationMode === 'pact') {
    available = actorData.spells?.pact?.value;
    maximum = actorData.spells?.pact?.max;
  } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
    // None
  } else {
    const level = itemData.level;
    if (level && level > 0) {
      available = actorData.spells?.[`spell${level}` as 'spell1']?.value;
      maximum = actorData.spells?.[`spell${level}` as 'spell1']?.max;
    }
  }
  if (typeof available !== 'number') {
    return null;
  }
  return { available, maximum };
}

function calculateWeaponUses(itemData: Weapon) {
  // If the weapon is a thrown weapon, but not a returning weapon, show quantity
  if (foundry.utils.getProperty(itemData.properties, 'thr') && !foundry.utils.getProperty(itemData.properties, 'ret')) {
    return { available: itemData.quantity };
  }
  return null;
}
