import dnd5e from './item-systems/dnd5e.js';
import pf1 from './item-systems/pf1.js';
import pf2 from './item-systems/pf2.js';
import demonlord from './item-systems/demonlord.js';
import archmage from './item-systems/archmage.js';
import generic from './item-systems/generic.js';

import * as specialtyModules from './specialty-modules.js';

export const getItemSystem = () => {
  switch (game.system.id) {
    case 'dnd5e':
      return dnd5e;
    case 'pf1':
      return pf1;
    case 'pf2e':
      return pf2;
    case 'demonlord':
      return demonlord;
    case 'archmage':
      return archmage;
    default:
      return generic;
  }
};

const canCalculateSystemUses = (command) => {
  const itemSystem = getItemSystem();
  return itemSystem != null && itemSystem.canCalculateUses(command);
};

const calculateSystemUses = async (command) => {
  const itemSystem = getItemSystem();
  return itemSystem === null ? null : itemSystem.calculateUses(command);
};

export const canCalculateUses = (command) => {
  return canCalculateSystemUses(command) || specialtyModules.canCalculateUses(command);
};

export const calculateUses = async (command) => {
  return await calculateSystemUses(command) || await specialtyModules.calculateUses(command);
};
