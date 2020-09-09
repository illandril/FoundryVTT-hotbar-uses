import dnd5e from './item-systems/dnd5e.js';
import pf1 from './item-systems/pf1.js';
import pf2 from './item-systems/pf2.js';
import demonlord from './item-systems/demonlord.js';

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
