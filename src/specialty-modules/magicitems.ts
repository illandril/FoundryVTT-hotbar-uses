import module from '../module';
import SpecialtyModule from './SpecialtyModule';
import type { AbstractOwnedEntry } from './magic-items-2';

const MODULE_ID = 'magic-items-2';
const DEFAULT_MACRO_REGEX_ARRAY = [
  // MagicItems.roll(magicItemName, itemName)
  // Support for the magic-items-2 module: https://github.com/PwQt/magic-items-2
  /^\s*MagicItems\s*\.\s*roll\s*\(\s*(?<q>["'`])(?<magicItemName>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*\)\s*;?\s*$/,
];

class MagicItemsModule extends SpecialtyModule<AbstractOwnedEntry> {
  constructor() {
    super(
      MODULE_ID,
      DEFAULT_MACRO_REGEX_ARRAY,
      (actor, itemLookupDetails) => {
        module.logger.debug('MagicItemsModule.getItems', actor.id, itemLookupDetails);
        const magicItemActor = MagicItems.actor(actor.id);
        module.logger.debug('MagicItemsModule.getItems - actor', magicItemActor);
        if (!magicItemActor) {
          return [];
        }

        const magicItemName = itemLookupDetails.groups.magicItemName;
        const magicItem = magicItemActor.items.find((item) => item.name === magicItemName);
        module.logger.debug('MagicItemsModule.getItems - item', magicItem);
        if (!magicItem) {
          return [];
        }

        const itemName = itemLookupDetails.groups.itemName;
        const ownedEntry = magicItem.ownedEntries.find((item) => item.name === itemName);
        module.logger.debug('MagicItemsModule.getItems - ownedEntry', magicItem);
        if (!ownedEntry) {
          return [];
        }

        return [ownedEntry];
      },
      (item) => {
        module.logger.debug('MagicItemsModule.calculateUsesForItem', item);
        let consumption: number;
        if (typeof item.item.consumption === 'number') {
          consumption = item.item.consumption;
        } else {
          consumption = Number.parseInt(item.item.consumption, 10);
        }
        if (consumption < 1) {
          return Promise.resolve(null);
        }
        const charges = item.magicItem.charges;
        const uses = item.magicItem.chargesOnWholeItem ? item.magicItem.uses : item.uses;
        const available = Math.floor(uses / consumption);
        const maximum = Math.floor(charges / consumption);
        return Promise.resolve({ available, maximum });
      },
    );
  }
}
export default new MagicItemsModule();
