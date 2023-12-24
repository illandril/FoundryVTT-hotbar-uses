import module from '../module';
import ItemSystem from './ItemSystem';
import archmage from './systems/archmage';
import demonlord from './systems/demonlord';
import dnd5e from './systems/dnd5e';
import generic from './systems/generic';
import pf1 from './systems/pf1';
import pf2 from './systems/pf2';

const systems = [
  archmage,
  demonlord,
  dnd5e,
  pf1,
  pf2,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSystem: ItemSystem<any> | undefined;
export const getItemSystem = () => {
  if (!cachedSystem) {
    cachedSystem = (() => {
      for (const system of systems) {
        if (game.system.id === system.systemID) {
          return system;
        }
      }
      module.logger.warn(game.system.id, 'is not supported - only HotbarUsesGeneric lookups will work. Go to the GitHub page for this module to learn more and/or to request support for this system: https://github.com/illandril/FoundryVTT-hotbar-uses');
      return generic;
    })();
  }
  return cachedSystem;
};

export const calculateUses = async (command: string | null) => {
  return getItemSystem().calculateUses(command);
};
