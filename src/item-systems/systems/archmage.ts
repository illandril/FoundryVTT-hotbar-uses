// archmage is "Toolkit13 (13th Age Compatible)" / "13th Age"
import getNumber from '../../lookups/getNumber';
import ItemSystem from '../ItemSystem';

const SYSTEM_ID = 'archmage';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // Roll Item macro
  /^\s*game\s*\.\s*archmage\s*\.\s*rollItemMacro\s*\(\s*(?<q>["'`])(?<itemName>.+?)\k<q>\s*\)\s*;?\s*$/,
];

class Toolkit13ItemSystem extends ItemSystem<Item> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/require-await
    super(SYSTEM_ID, DEFAULT_MACRO_REGEX_ARRAY, async (item) => {
      const itemData = item.system as {
        quantity?: {
          value?: string | number | null
        }
        maxQuantity?: {
          value?: string | number | null
        }
      };
      const quantity = itemData.quantity;
      const maxQuantity = itemData.maxQuantity;
      if (quantity && maxQuantity) {
        const available = getNumber(quantity, 'value') || 0;
        const maximum = getNumber(maxQuantity, 'value');
        if (maximum !== null) {
          return {
            available, maximum,
          };
        }
      }
      return null;
    });
  }
}
export default new Toolkit13ItemSystem();
