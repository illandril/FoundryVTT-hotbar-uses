import ItemSystem from './item-systems/ItemSystem';
import dnd5e from './item-systems/systems/dnd5e';
// import pf1 from './item-systems/pf1.js';
// import pf2 from './item-systems/pf2.js';
// import demonlord from './item-systems/demonlord.js';
// import archmage from './item-systems/archmage.js';
import generic from './item-systems/systems/generic';
import module from './module';

// import * as specialtyModules from './specialty-modules.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSystem: ItemSystem<any> | undefined;
export const getItemSystem = () => {
  if (!cachedSystem) {
    cachedSystem = (() => {
      switch (game.system.id) {
        case 'dnd5e':
          return dnd5e;
          // case 'pf1':
          //   return pf1;
          // case 'pf2e':
          //   return pf2;
          // case 'demonlord':
          //   return demonlord;
          // case 'archmage':
          //   return archmage;
        default:
          module.logger.warn(game.system.id, 'is not supported - only HotbarUsesGeneric lookups will work. Go to the GitHub page for this module to learn more and/or to request support for this system: https://github.com/illandril/FoundryVTT-hotbar-uses');
          return generic;
      }
    })();
  }
  return cachedSystem;
};

const canCalculateSystemUses = (command: string | null) => {
  const itemSystem = getItemSystem();
  return itemSystem.canCalculateUses(command);
};

const calculateSystemUses = async (command: string | null) => {
  const itemSystem = getItemSystem();
  return itemSystem.calculateUses(command);
};

export const canCalculateUses = (command: string | null) => {
  return canCalculateSystemUses(command);// || specialtyModules.canCalculateUses(command);
};

export const calculateUses = async (command: string | null) => {
  return /* await*/ calculateSystemUses(command);// || await specialtyModules.calculateUses(command);
};
