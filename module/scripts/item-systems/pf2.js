import ItemSystem from './item-system.js';

const SYSTEM_ID = 'pf2e';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Standard pf2e system Roll Item macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemID>.+)\k<q>\s*\)\s*;?\s*$/,

  // Standard pf2e system Roll Action macro
  /^\s*game\s*\.\s*pf2e\s*\.\s*rollActionMacro\s*\(\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*,\s*(?<actionIndex>\d+)\s*,\s*(?<q2>["'`])(?<actionName>.+)\k<q2>\s*\)\s*;?\s*$/,

  // Comment: // HotbarUsesPF2e: ActorID="X" ItemID="Y"
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF2e:\s*ActorID\s*=\s*(?<q>["'`])(?<actorID>.+)\k<q>\s*ItemID\s*=\s*(?<qb>["'`])(?<itemID>.+)\k<qb>\s*(\n.*)?$/is,

  // Comments: // HotbarUsesPF2e: ActorName="X" ItemName="Y" ItemType="Z" (ActorName and ItemType optional)
  /^(.*\n)?\s*\/\/\s*HotbarUsesPF2e:\s*(ActorName\s*=\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*)?ItemName\s*=\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*(ItemType\s*=\s*(?<qc>["'`])(?<itemType>.+)\k<qc>\s*)?(\n.*)?$/is,
];

class PF2eItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  async calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new PF2eItemSystem();

function calculateUsesForItem(itemOrAction) {
  if (itemOrAction instanceof Item) {
    return calculateUsesForActualItem(itemOrAction);
  } else {
    return calculateUsesForAction(itemOrAction);
  }
}

function calculateUsesForActualItem(item) {
  if (item.type === 'consumable' || item.type === 'equipment' || item.type === 'treasure') {
    const itemData = item.data.data;
    if (itemData.quantity) {
      return calculateQuantityAndChargesUses(itemData);
    }
  }
  // TODO Figure out how (and if) other types should be calculated
  return null;
}

function getAmmoForAction(action) {
  let ammo;
  if (action.ammunition && action.ammunition.selectedAmmo || action.selectedAmmoId) {
    const selectedAmmoId = action.ammunition?.selectedAmmo?.id || action.selectedAmmoId;
    let ammoFilter = (a) => a._id === selectedAmmoId;
    if(action.ammunition) {
      if(action.ammunition.compatible) {
        ammo = action.ammunition.compatible.find(ammoFilter);
      }
      if(!ammo && action.ammunition.incompatible) {
        ammo = action.ammunition.incompatible.find(ammoFilter);
      }
    }
    if(!ammo && action.ammo) {
      ammo = action.ammo.find(ammoFilter);
    }
  }
  return ammo;
}

function calculateUsesForAction(action) {
  const ammo = getAmmoForAction(action);
  if (ammo) {
    return {
      ...calculateQuantityAndChargesUses(ammo.data),
      isAmmunition: true,
    };
  }
  // TODO Figure out how (and if) other actions should have uses
  return null;
}

const extractQuantity = (itemData) => {
  let quantity = itemData.quantity;
  if ( typeof quantity === 'object' ) {
    quantity = quantity.value;
  }
  quantity = parseInt(quantity, 10) || 0;
  return quantity;
};

function calculateQuantityAndChargesUses(itemData) {
  const quantity = extractQuantity(itemData);
  const chargesData = itemData.charges;
  if (chargesData) {
    const charges = parseInt(chargesData.value) || 0;
    const maxCharges = parseInt(chargesData.max) || 0;
    if (maxCharges > 1) {
      return {
        available: charges + maxCharges * (quantity - 1),
        maximum: maxCharges * quantity,
      };
    }
  }
  return { available: quantity };
}
