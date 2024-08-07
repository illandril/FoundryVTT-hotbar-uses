import getNumber from '../../lookups/getNumber';
import ItemSystem from '../ItemSystem';

const SYSTEM_ID = 'pf2e';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf2e system Roll Item macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemID>.+?)\k<q>\s*\)\s*;?\s*$/,

  // Legacy pf2e system Roll Action macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollActionMacro\s*\(\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*,\s*(?<actionIndex>\d+?)\s*,\s*(?<q2>["'`])(?<actionName>.+?)\k<q2>\s*\)\s*;?\s*$/,

  // Standard pf2e system Roll Action macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollActionMacro\s*\(\s*\{\s*actorUUID\s*:\s*(?<q>["'`])Actor\.(?<actorID>.+?)\k<q>\s*.*itemId\s*:\s*(?<q2>["'`])(?<itemID>.+?)\k<q2>.*?\}\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesPF2e: ActorID="X" ItemID="Y"
  /\s*\/\/\s*HotbarUsesPF2e\s*:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+?)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+?)\k<qb>\s*(\n.*)?$/is,

  // Comment: // HotbarUsesPF2e: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /\s*\/\/\s*HotbarUsesPF2e\s*:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+?)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+?)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+?)\k<qc>\s*)?(\n.*)?$/is,
];

type Ammo = ItemSystemData & {
  _id?: string;
};
type AmmoList = {
  find: (predicate: (value: Ammo) => boolean) => Ammo;
};
type Action = {
  ammunition?: {
    selectedAmmo?: {
      id?: string;
    };
    compatible?: AmmoList;
    incompatible?: AmmoList;
  };
  selectedAmmoId?: string;
  ammo?: AmmoList;
};

type ItemSystemData = {
  quantity?:
    | number
    | string
    | {
        value?: number | string;
      };
  charges?: {
    value?: number | string;
    max?: number | string;
  };
};
class PF2eItemSystem extends ItemSystem<pf2e.internal.item.ItemPF2e> {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY, (item) => {
      return Promise.resolve(calculateUsesForItem(item));
    });
  }
}
export default new PF2eItemSystem();

function calculateUsesForItem(itemOrAction: pf2e.internal.item.ItemPF2e | Action) {
  if (itemOrAction instanceof Item) {
    return calculateUsesForActualItem(itemOrAction);
  }
  return calculateUsesForAction(itemOrAction);
}

function calculateUsesForActualItem(item: pf2e.internal.item.ItemPF2e) {
  if (item.type === 'consumable' || item.type === 'equipment' || item.type === 'treasure') {
    const itemData = item.system as ItemSystemData;
    if (itemData.quantity) {
      return calculateQuantityAndChargesUses(itemData);
    }
  }
  // TODO Figure out how (and if) other types should be calculated
  return null;
}

function getAmmoForAction(action: Action) {
  let ammo: Ammo | undefined;
  if (action.ammunition?.selectedAmmo || action.selectedAmmoId) {
    const selectedAmmoId = action.ammunition?.selectedAmmo?.id || action.selectedAmmoId;
    const ammoFilter = (a: { _id?: string }) => a._id === selectedAmmoId;
    if (action.ammunition) {
      if (action.ammunition.compatible) {
        ammo = action.ammunition.compatible.find(ammoFilter);
      }
      if (!ammo && action.ammunition.incompatible) {
        ammo = action.ammunition.incompatible.find(ammoFilter);
      }
    }
    if (!ammo && action.ammo) {
      ammo = action.ammo.find(ammoFilter);
    }
  }
  return ammo;
}

function calculateUsesForAction(action: Action) {
  const ammo = getAmmoForAction(action);
  if (ammo) {
    return {
      ...calculateQuantityAndChargesUses(ammo),
      isAmmunition: true,
    };
  }
  // TODO Figure out how (and if) other actions should have uses
  return null;
}

const extractQuantity = (itemData: ItemSystemData) => {
  let quantity = itemData.quantity;
  if (typeof quantity === 'object') {
    quantity = quantity.value;
  }
  if (typeof quantity === 'string') {
    quantity = Number.parseInt(quantity, 10);
  }
  return quantity || 0;
};

function calculateQuantityAndChargesUses(itemData: ItemSystemData) {
  const quantity = extractQuantity(itemData);
  const chargesData = itemData.charges;
  if (chargesData) {
    const charges = getNumber(chargesData, 'value') || 0;
    const maxCharges = getNumber(chargesData, 'max') || 0;
    if (maxCharges > 1) {
      return {
        available: charges + maxCharges * (quantity - 1),
        maximum: maxCharges * quantity,
      };
    }
  }
  return { available: quantity };
}
