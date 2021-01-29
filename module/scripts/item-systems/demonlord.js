// Support for the Shadow of the Demon Lord system was initially added by Xacus
import ItemSystem from './item-system.js';

const SYSTEM_ID = 'demonlord';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Roll Talent macro
  /^\s*game\s*\.\s*demonlord\s*\.\s*rollTalentMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // Roll Spell macro
  /^\s*game\s*\.\s*demonlord\s*\.\s*rollSpellMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesDemonLord: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUsesDemonLord:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUsesDemonLord: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUsesDemonLord:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*)?(\n.*)?$/is,
];

class DemonLordItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  async calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new DemonLordItemSystem();

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

function consumedValueMax(uses) {
  if (uses) {
    const consumed = parseInt(uses.value, 10) || 0;
    const maximum = parseInt(uses.max, 10) || 0;
    if (consumed > 0 || maximum > 0) {
      return { consumed, maximum };
    }
  }
  return null;
}

function calculateTalentUses(item) {
  return consumedValueMax(item.uses);
}

function calculateSpellUses(item) {
  return consumedValueMax(item.castings);
}
