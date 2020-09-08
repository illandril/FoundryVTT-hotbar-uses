import * as dnd5e from './dnd5e.js';
import * as pf1 from './pf1.js';
import * as pf2 from './pf2.js';
import * as demonlord from './demonlord.js';

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
    default:
      return null;
  }
};

export const canCalculateUses = (command) => {
  const itemSystem = getItemSystem();
  return itemSystem != null && itemSystem.canCalculateUses(command);
};

export const calculateUses = (command) => {
  const itemSystem = getItemSystem();
  return itemSystem === null ? null : itemSystem.calculateUses(command);
};
