import { getActor } from '../item-systems/item-system.js';

const setDefaultMacroRegexArray = (moduleID, macroRegexArray) => {
  const specialtyMacros = {};
  specialtyMacros[moduleID] = macroRegexArray;
  mergeObject(CONFIG, {
    illandril: {
      hotbarUses: {
        specialtyMacros,
      },
    },
  });
};

const getMacroRegexArray = (moduleID) => {
  return CONFIG.illandril.hotbarUses.specialtyMacros[moduleID];
};

const getItemLookupDetailsForCommand = (moduleID, command) => {
  let results = null;
  if (command) {
    getMacroRegexArray(moduleID).some((regex) => {
      const match = command.match(regex);
      if (match) {
        results = match.groups;
        return true;
      }
    });
  }
  return results;
};

export default class SpecialtyModule {
  constructor(moduleID, macroRegexArray) {
    this._moduleID = moduleID;
    setDefaultMacroRegexArray(moduleID, macroRegexArray);
  }

  isModuleActive() {
    const module = game.modules.get(this._moduleID);
    return module && module.active;
  }

  canCalculateUses(command) {
    return getItemLookupDetailsForCommand(this._moduleID, command) !== null;
  }

  async calculateUses(command) {
    const itemLookupDetails = getItemLookupDetailsForCommand(this._moduleID, command);
    if (!itemLookupDetails) {
      // Not an item command, assume infinite uses.
      return null;
    }
    const actor = this.getActor(itemLookupDetails);
    if (!actor) {
      // It's an item, but there's no actor, so it can't be used.
      return 0;
    }
    return await this.calculateUsesForItems(this.getItems(actor, itemLookupDetails));
  }

  getActor(itemLookupDetails) {
    return getActor(itemLookupDetails);
  }

  getItems(actor, itemLookupDetails) {
    throw new Error(`SpecialtyModule for ${this._moduleID} did not implement calculateUsesForItem`);
  }

  async calculateUsesForItems(items) {
    if (items.length === 0) {
      return { available: 0 };
    }
    let uses = {};
    for (let item of items) {
      let thisItemUses = await this.calculateUsesForItem(item);
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

  async calculateUsesForItem(item) {
    throw new Error(`SpecialtyModule for ${this._moduleID} did not implement calculateUsesForItem`);
  }
}
