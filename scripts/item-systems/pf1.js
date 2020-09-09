import ItemSystem from './item-system.js';

const SYSTEM_ID = 'pf1';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf1 system Roll Item macro
  // TODO: Support PF1
  // game.pf1.rollItemMacro("Potion of Cure Light Wounds", {
  //   itemId: "itxBiNKqX86t4lYd",
  //   itemType: "consumable",
  //   actorId: "hTaX5U6D1UFjnYjk",
  // });
  ///^\s*game\s*\.\s*pf1\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesPF1: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF1:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUsesPF1: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF1:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*)?(\n.*)?$/is,
];

class PF1ItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new PF1ItemSystem();

function calculateUsesForItem(item) {
  // TODO: Actually calculate uses
  return null;
}
