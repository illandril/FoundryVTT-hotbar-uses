import getActor from '../lookups/getActor';
import { ItemLookupDetails } from '../lookups/getItemLookupDetailsForCommandFromRegex';
import getItems from '../lookups/getItems';
import getNumber from '../lookups/getNumber';
import module from '../module';
import addNullable from './addNullable';
import getItemLookupDetailsForCommand from './getItemLookupDetailsForCommand';
import { setDefaultMacroRegexArray } from './macroSettings';

export type ItemUses = {
  isAmmunition?: boolean | null
  available?: number | null
  consumed?: number | null
  maximum?: number | null
  showZeroUses?: boolean
};

const genericCalculateUses = (actor: Actor, items: Item[] | null, itemLookupDetails: ItemLookupDetails): ItemUses => {
  if (!itemLookupDetails.available && !itemLookupDetails.consumed) {
    module.logger.error('Available or Consumed must be specified when using HotbarUsesGeneric');
    return { available: -1 };
  }
  if (items) {
    let consumed: number | null = null;
    let available: number | null = null;
    let maximum: number | null = null;
    for (const item of items) {
      const itemAvailable = getNumber(item, itemLookupDetails.available);
      const itemConsumed = getNumber(item, itemLookupDetails.consumed);
      const itemMaximum = getNumber(item, itemLookupDetails.max);
      available = addNullable(available, itemAvailable);
      consumed = addNullable(consumed, itemConsumed);
      maximum = addNullable(maximum, itemMaximum);
    }
    return {
      showZeroUses: available !== null || consumed !== null,
      available: available === null ? undefined : available,
      consumed: consumed === null ? undefined : consumed,
      maximum: maximum === null ? undefined : maximum,
    };
  }
  const available = getNumber(actor, itemLookupDetails.available);
  const consumed = getNumber(actor, itemLookupDetails.consumed);
  const maximum = getNumber(actor, itemLookupDetails.max);
  return {
    showZeroUses: available !== null || consumed !== null,
    available: available === null ? undefined : available,
    consumed: consumed === null ? undefined : consumed,
    maximum: maximum === null ? undefined : maximum,
  };
};

export default class ItemSystem<T extends Item> {
  constructor(readonly systemID: string, macroRegexArray: RegExp[], private calculateUsesForItem: (item: T) => Promise<ItemUses | null>) {
    setDefaultMacroRegexArray(systemID, macroRegexArray);
  }

  async calculateUses(command: string | null): Promise<ItemUses | null> {
    const itemLookupDetails = getItemLookupDetailsForCommand(this.systemID, command);
    if (!itemLookupDetails) {
      // Not an item command, assume infinite uses.
      return null;
    }
    const actor = getActor(itemLookupDetails);
    if (!actor) {
      // It's an item, but there's no actor, so it can't be used.
      module.logger.debug('Could not find actor', itemLookupDetails);
      return { available: 0 };
    }
    const items = getItems<T>(actor, itemLookupDetails);
    if (itemLookupDetails.generic) {
      module.logger.debug('generic uses', itemLookupDetails);
      return genericCalculateUses(actor, items, itemLookupDetails);
    }
    module.logger.debug('Items uses', itemLookupDetails, items);
    return this.calculateUsesForItems(items);
  }

  private async calculateUsesForItems(items: T[] | null): Promise<ItemUses | null> {
    if (!items?.length) {
      module.logger.debug('No items');
      return { available: 0 };
    }
    let uses: ItemUses | null = {
      showZeroUses: true,
    };
    const allItemUses = await Promise.all(items.map((item) => this.calculateUsesForItem(item)));
    module.logger.debug('Item uses', items, allItemUses);
    for (const thisItemUses of allItemUses) {
      if (!thisItemUses) {
        uses = null;
        break;
      }
      if (thisItemUses.isAmmunition) {
        // If there are multiple items of the same name, chances are they use the same ammunition
        // Adding the uses together from multiple items would count the ammunition multiple times
        uses = thisItemUses;
        break;
      }
      if (typeof thisItemUses.available === 'number') {
        if (typeof uses.available === 'number') {
          uses.available += thisItemUses.available;
        } else {
          uses.available = thisItemUses.available;
        }
      }
      if (typeof thisItemUses.consumed === 'number') {
        if (typeof uses.consumed === 'number') {
          uses.consumed += thisItemUses.consumed;
        } else {
          uses.consumed = thisItemUses.consumed;
        }
      }
      if (typeof thisItemUses.maximum === 'number') {
        if (typeof uses.maximum === 'number') {
          uses.maximum += thisItemUses.maximum;
        } else {
          uses.maximum = thisItemUses.maximum;
        }
      }
    }
    return uses;
  }
}
