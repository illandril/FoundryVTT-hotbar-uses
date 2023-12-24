// Support for the Shadow of the Demon Lord system was initially added by Xacus
import getNumber from '../../lookups/getNumber';
import ItemSystem from '../ItemSystem';

const SYSTEM_ID = 'demonlord';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Roll Talent macro
  /^(\s*\/\/.+\n)?\s*game\s*\.\s*demonlord\s*\.\s*rollTalentMacro\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*(,\s*(?<qb>["'`])true\k<qb>\s*)?\)\s*;?\s*$/,

  // Roll Spell macro
  /^\s*game\s*\.\s*demonlord\s*\.\s*rollSpellMacro\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesDemonLord: ActorID="X" ItemID="Y"
  /\s*\/\/\s*HotbarUsesDemonLord\s*:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*(\n.*)?$/is,

  // Comment: // HotbarUsesDemonLord: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /\s*\/\/\s*HotbarUsesDemonLord\s*:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+?)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+?)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+?)\k<qc>\s*)?(\n.*)?$/is,
];

type MaybeUses = { value?: string | number | null, max?: string | number | null } | null | undefined;
type DLItem = Item & ({
  type: 'spell'
  system: {
    castings: MaybeUses
  }
} | {
  type: 'talent'
  system: {
    uses: MaybeUses
  }
});

class DemonLordItemSystem extends ItemSystem<DLItem> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/require-await
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY, async (item) => {
      if (item.type === 'spell') {
        return calculateSpellUses(item.system);
      }
      if (item.type === 'talent') {
        return calculateTalentUses(item.system);
      }
      return null;
    });
  }
}
export default new DemonLordItemSystem();

function consumedValueMax(uses: MaybeUses) {
  if (uses) {
    const consumed = getNumber(uses, 'value') || 0;
    const maximum = getNumber(uses, 'max') || 0;
    if (consumed > 0 || maximum > 0) {
      return { consumed, maximum };
    }
  }
  return null;
}

function calculateTalentUses(item: { uses: MaybeUses } | null | undefined) {
  return consumedValueMax(item?.uses);
}

function calculateSpellUses(item: { castings: MaybeUses } | null | undefined) {
  return consumedValueMax(item?.castings);
}
