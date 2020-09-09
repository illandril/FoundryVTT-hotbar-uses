import ItemSystem from './item-system.js';

const SYSTEM_ID = 'pf2e';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf2e system Roll Item macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemID>.+)\k<q>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesPF2e: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF2e:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUsesPF2e: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF2e:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*)?(\n.*)?$/is,
];

class PF2eItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new PF2eItemSystem();

function calculateUsesForItem(item) {
  // TODO: Deal with charges and other data types
  if (item.type === 'consumable' && item.data.data.quantity) {
    return { available: item.data.data.quantity.value };
  }
  return null;
}
