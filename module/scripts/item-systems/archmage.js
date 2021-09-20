// archmage is "Toolkit13 (13th Age Compatible)"
import ItemSystem from './item-system.js';

const SYSTEM_ID = 'archmage';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Roll Item macro
  /^\s*game\s*\.\s*archmage\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+)\k<q>\s*\)\s*;?\s*$/,
];

class Toolkit13ItemSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  async calculateUsesForItem(item) {
    return calculateUsesForItem(item);
  }
}
export default new Toolkit13ItemSystem();

function calculateUsesForItem(item) {
  const itemData = item.data.data;
  const quantity = itemData.quantity;
  const maxQuantity = itemData.maxQuantity;
  if(quantity && maxQuantity) {
    const available = parseInt(quantity.value, 10) || 0;
    const maximum = parseInt(maxQuantity.value, 10);
    if(!isNaN(maximum)) {
      return {
        available, maximum
      };
    }
  }
  return null;
}
