import getActor from '../lookups/getActor';
import { ItemLookupDetails } from '../lookups/getItemLookupDetailsForCommandFromRegex';
import getItems from '../lookups/getItems';
import getNumber from '../lookups/getNumber';
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
  if (items) {
    let consumed = null;
    let available = null;
    let maximum = null;
    for (const item of items) {
      const itemAvailable = getNumber(item, itemLookupDetails.available);
      const itemConsumed = getNumber(item, itemLookupDetails.consumed);
      const itemMaximum = getNumber(item, itemLookupDetails.max);
      available = addNullable(consumed, itemAvailable);
      consumed = addNullable(consumed, itemConsumed);
      maximum = addNullable(consumed, itemMaximum);
    }
    return {
      available,
      consumed,
      maximum,
    };
  }
  const available = getNumber(actor, itemLookupDetails.available);
  const consumed = getNumber(actor, itemLookupDetails.consumed);
  const maximum = getNumber(actor, itemLookupDetails.max);
  return {
    showZeroUses: available !== null,
    available,
    consumed,
    maximum,
  };
};

export default class ItemSystem<T extends Item> {
  constructor(private systemID: string, macroRegexArray: RegExp[], private calculateUsesForItem: (item: T) => Promise<ItemUses | null>) {
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
      return { available: 0 };
    }
    const items = getItems<T>(actor, itemLookupDetails);
    if (itemLookupDetails.generic) {
      return genericCalculateUses(actor, items, itemLookupDetails);
    }
    return this.calculateUsesForItems(items);
  }

  private async calculateUsesForItems(items: T[] | null): Promise<ItemUses | null> {
    if (!items?.length) {
      return { available: 0 };
    }
    let uses: ItemUses | null = {
      showZeroUses: true,
    };
    const allItemUses = await Promise.all(items.map((item) => this.calculateUsesForItem(item)));
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
