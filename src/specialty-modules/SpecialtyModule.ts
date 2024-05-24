import type { ItemUses } from '../item-systems/ItemSystem';
import getActor from '../lookups/getActor';
import getItemLookupDetailsForCommandFromRegex from '../lookups/getItemLookupDetailsForCommandFromRegex';
import module from '../module';
import { getMacroRegexArray, setDefaultMacroRegexArray } from './macroSettings';

const getItemLookupDetailsForCommand = (moduleID: string, command: string | null) => {
  const results = getItemLookupDetailsForCommandFromRegex(getMacroRegexArray(moduleID), command);
  module.logger.debug('getItemLookupDetailsForCommand', moduleID, command, results);
  if (results) {
    return {
      ...results.groups,
      ...results,
    };
  }
  return results;
};
type ExpandedItemLookupDetails = NonNullable<ReturnType<typeof getItemLookupDetailsForCommand>>;

export default class SpecialtyModule<T> {
  constructor(
    private moduleID: string,
    macroRegexArray: RegExp[],
    private getItems: (actor: Actor, itemLookupDetails: ExpandedItemLookupDetails) => T[] | null,
    private calculateUsesForItem: (item: T) => Promise<ItemUses | null>,
  ) {
    setDefaultMacroRegexArray(moduleID, macroRegexArray);
  }

  isModuleActive() {
    return game.modules.get(this.moduleID)?.active ?? false;
  }

  canCalculateUses(command: string | null) {
    return getItemLookupDetailsForCommand(this.moduleID, command) !== null;
  }

  async calculateUses(command: string | null) {
    const itemLookupDetails = getItemLookupDetailsForCommand(this.moduleID, command);
    if (!itemLookupDetails) {
      // Not an item command, assume infinite uses.
      return null;
    }
    const actor = this.getActor(itemLookupDetails);
    if (!actor) {
      // It's an item, but there's no actor, so it can't be used.
      return { available: 0 };
    }
    return await this.calculateUsesForItems(this.getItems(actor, itemLookupDetails));
  }

  getActor(itemLookupDetails: ExpandedItemLookupDetails) {
    return getActor(itemLookupDetails);
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Legacy
  async calculateUsesForItems(items: T[] | null) {
    if (!items?.length) {
      return { available: 0 };
    }
    let uses: ItemUses | null = {};
    const allItemUses = await Promise.all(items.map((item) => this.calculateUsesForItem(item)));
    for (const thisItemUses of allItemUses) {
      if (thisItemUses === null) {
        uses = null;
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
