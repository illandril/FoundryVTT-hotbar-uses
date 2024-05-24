import ItemSystem, { type ItemUses } from '../ItemSystem';

const SYSTEM_ID = 'pf1';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf1 system Roll Item macro
  /^\s*game\s*\.\s*pf1\s*\.\s*rollItemMacro\s*\([\s\S]*itemId:\s*(?<q1>["'`])(?<itemID>.+?)\k<q1>[\s\S]*actorId:\s*(?<q2>["'`])(?<actorID>.+?)\k<q2>/,

  // Standard pf1 system Roll Item macro, but reversed itemID/actorID order
  /^\s*game\s*\.\s*pf1\s*\.\s*rollItemMacro\s*\([\s\S]*actorId:\s*(?<q2>["'`])(?<actorID>.+?)\k<q2>[\s\S]*itemId:\s*(?<q1>["'`])(?<itemID>.+?)\k<q1>/,

  // fromUuidSync("Actor.<actorId>.Item.<itemId>").use()
  /^\s*fromUuidSync\(\s*(?<q>["'`])Actor\.(?<actorID>[^.]+)\.Item\.(?<itemID>[^.]+?)\k<q>\s*\)\.use\(\)\s*;?\s*$/,

  // Comment: // HotbarUsesPF1: ActorID="X" ItemID="Y"
  /\s*\/\/\s*HotbarUsesPF1\s*:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*(\n.*)?$/is,

  // Comment: // HotbarUsesPF1: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /\s*\/\/\s*HotbarUsesPF1\s*:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+?)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+?)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+?)\k<qc>\s*)?(\n.*)?$/is,
];

type Action = {
  data?: {
    usesAmmo?: boolean;
  };
};

type PF1Item = Item & {
  type?: string;
  isCharged?: boolean;
  hasAction?: boolean;
  system: {
    actions?: {
      length?: number;
    };
    quantity?: number;
  };
  firstAction?: Action;
  getSpellUses?: (max?: boolean) => number;
  chargeCost?: number;
  charges?: number;
  maxCharges?: number;
  getDefaultChargeCost?: () => number;
  isSingleUse?: boolean;
};

class PF1ItemSystem extends ItemSystem<PF1Item> {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY, (item) => {
      let uses: ItemUses | null = null;
      if (item.type === 'spell') {
        uses = calculateSpellUses(item);
      } else if (item.isCharged) {
        uses = calculateChargeUses(item);
      } else if (item.hasAction && item.system.actions?.length === 1) {
        uses = calculateActionUses(item, item.firstAction);
      }
      return Promise.resolve(uses);
    });
  }
}
export default new PF1ItemSystem();

const calculateSpellUses = (item: PF1Item) => {
  if (item.getSpellUses) {
    let available = item.getSpellUses();
    if (available === Number.POSITIVE_INFINITY) {
      return null;
    }
    let maximum = item.getSpellUses(true);
    if (item.chargeCost && item.chargeCost > 1) {
      available = Math.floor(available / item.chargeCost);
      maximum = Math.floor(maximum / item.chargeCost);
    }
    return { available, maximum };
  }
  return null;
};

const calculateActionUses = (item: PF1Item, action: Action | undefined) => {
  if (action?.data?.usesAmmo) {
    const ammoId = item.getFlag('pf1', 'defaultAmmo');
    if (typeof ammoId !== 'string') {
      return null;
    }
    const ammo = item.actor?.items.get(ammoId) as PF1Item | undefined;
    if (ammo?.getFlag('pf1', 'abundant')) {
      return null;
    }

    const quantity = ammo?.system.quantity ?? 0;
    return {
      available: quantity,
      isAmmunition: true,
    };
  }
  return null;
};

const calculateChargeUses = (item: PF1Item) => {
  let available = item.charges || 0;
  let maximum = item.maxCharges || 0;
  const chargeCost = item.getDefaultChargeCost?.() ?? item.chargeCost ?? 1;
  if (chargeCost > 1) {
    available = Math.floor(available / chargeCost);
    maximum = Math.floor(maximum / chargeCost);
  }
  if (item.isSingleUse) {
    return {
      available,
      isAmmunition: true,
    };
  }
  return { available, maximum };
};
