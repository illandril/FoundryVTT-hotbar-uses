import SpecialtyModule from './specialty-module.js';
const MODULE_ID = 'magicitems';

const DEFAULT_MACRO_REGEX_ARRAY = [
  // MagicItems.roll(magicItemName, itemName)
  // Support for the magicitems module: https://gitlab.com/riccisi/foundryvtt-magic-items/
  /^\s*MagicItems\s*\.\s*roll\s*\(\s*(?<q>["'`])(?<magicItemName>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*\)\s*;?\s*$/,
];

class MagicItemsModule extends SpecialtyModule {
  constructor() {
    super(MODULE_ID, DEFAULT_MACRO_REGEX_ARRAY);
  }

  getItems(actor, itemLookupDetails) {
    const magicItemActor = MagicItems.actor(actor.id);
    if(!magicItemActor) {
      return [];
    }

    const magicItemName = itemLookupDetails.magicItemName;
    const magicItem = magicItemActor.items.find(item => item.name === magicItemName);
    if(!magicItem) {
      return [];
    }

    const itemName = itemLookupDetails.itemName;
    const magicItemItem = magicItem.ownedEntries.find(item => item.name === itemName);
    if(!magicItemItem) {
      return [];
    }

    return [magicItemItem];
  }

  async calculateUsesForItem(item) {
    if ( item.item.consumption < 1 ) {
      return null;
    }
    const charges = item.magicItem.chargesOnWholeItem ? item.magicItem.uses : item.uses;
    const available = Math.floor(charges / item.item.consumption);
    return { available };
  }
}
export default new MagicItemsModule();
